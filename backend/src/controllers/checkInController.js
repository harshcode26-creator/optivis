import Answer from "../models/Answer.js";
import Assignment from "../models/Assignment.js";
import CheckIn from "../models/CheckIn.js";
import User from "../models/User.js";
import detectBlockerKeywords from "../services/blocker.service.js";
import calculateSentimentScore from "../services/sentiment.service.js";
import generateInsights from "../services/llm.service.js";

const isMissing = (value) => !value || !String(value).trim();
const LLM_INSIGHTS_TIMEOUT_MS = 3500;

const resolveWithTimeout = async (promise, timeoutMs) =>
  new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(null), timeoutMs);

    promise
      .then((result) => resolve(result))
      .catch(() => resolve(null))
      .finally(() => clearTimeout(timeoutId));
  });

export const createCheckIn = async (req, res) => {
  const { title, period, questions } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (isMissing(title) || isMissing(period) || !Array.isArray(questions)) {
    return res.status(400).json({ message: "title, period, and questions are required" });
  }

  try {
    const workspaceId = req.user.workspaceId;

    const checkIn = await CheckIn.create({
      title,
      period,
      questions,
      workspaceId,
      createdBy: req.user._id,
    });

    const employees = await User.find({
      workspaceId,
      role: "EMPLOYEE",
    }).select("_id");

    await Promise.all(
      employees.map((employee) =>
        Assignment.create({
          userId: employee._id,
          checkInId: checkIn._id,
          workspaceId,
          status: "PENDING",
        })
      )
    );

    return res.status(201).json({ message: "Check-in created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyAssignments = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "EMPLOYEE") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const assignments = await Assignment.find({
      userId: req.user._id,
      workspaceId: req.user.workspaceId,
    })
      .populate("checkInId", "title questions")
      .sort({ createdAt: -1 });

    return res.status(200).json(assignments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyAssignmentDetails = async (req, res) => {
  const { assignmentId } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "EMPLOYEE") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (isMissing(assignmentId)) {
    return res.status(400).json({ message: "assignmentId is required" });
  }

  try {
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      userId: req.user.userId || req.user._id,
      workspaceId: req.user.workspaceId,
    }).populate("checkInId", "title questions");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    return res.status(200).json(assignment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSubmittedAssignments = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const assignments = await Assignment.find({
      workspaceId: req.user.workspaceId,
      status: "SUBMITTED",
    })
      .populate("userId", "name email")
      .populate("checkInId", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json(assignments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getInsights = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const { workspaceId } = req.user;

    const [
      totalAssignments,
      submittedCount,
      reviewedCount,
      assignmentsWithBlockers,
      assignmentsWithSentiment,
    ] = await Promise.all([
      Assignment.countDocuments({ workspaceId }),
      Assignment.countDocuments({ workspaceId, status: "SUBMITTED" }),
      Assignment.countDocuments({ workspaceId, reviewStatus: "REVIEWED" }),
      Assignment.find({
        workspaceId,
        blockerTags: { $exists: true, $ne: [] },
      }).select("blockerTags"),
      Assignment.find({
        workspaceId,
        sentimentScore: { $exists: true, $ne: null },
      }).select("sentimentScore"),
    ]);

    const blockerSummary = assignmentsWithBlockers
      .flatMap((assignment) => assignment.blockerTags || [])
      .reduce((summary, keyword) => {
        summary[keyword] = (summary[keyword] || 0) + 1;
        return summary;
      }, {});

    const totalSentiment = assignmentsWithSentiment.reduce(
      (sum, assignment) => sum + (assignment.sentimentScore || 0),
      0
    );

    const averageSentiment =
      assignmentsWithSentiment.length > 0 ? totalSentiment / assignmentsWithSentiment.length : 0;

    const basicInsights = {
      totalAssignments,
      submittedCount,
      reviewedCount,
      blockerSummary,
      averageSentiment,
    };

    const assignmentIds = await Assignment.find({ workspaceId }).distinct("_id");

    if (assignmentIds.length === 0) {
      return res.status(200).json(basicInsights);
    }

    const answers = await Answer.find({
      assignmentId: { $in: assignmentIds },
    }).select("answer");

    const combinedAnswersText = answers
      .map((answerDocument) => answerDocument.answer)
      .filter((answerText) => typeof answerText === "string" && answerText.trim())
      .join("\n");

    if (!combinedAnswersText) {
      return res.status(200).json(basicInsights);
    }

    const llmInsights = await resolveWithTimeout(
      generateInsights(combinedAnswersText),
      LLM_INSIGHTS_TIMEOUT_MS
    );

    if (!llmInsights) {
      return res.status(200).json(basicInsights);
    }

    return res.status(200).json({
      ...basicInsights,
      aiSummary: llmInsights.summary,
      aiSentiment: llmInsights.sentiment,
      aiBlockers: llmInsights.blockers,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAssignmentDetails = async (req, res) => {
  const { assignmentId } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (isMissing(assignmentId)) {
    return res.status(400).json({ message: "assignmentId is required" });
  }

  try {
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      workspaceId: req.user.workspaceId,
    })
      .populate("userId", "name email")
      .populate("checkInId", "title");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const answers = await Answer.find({ assignmentId: assignment._id }).sort({ updatedAt: -1 });

    return res.status(200).json({
      assignment,
      answers,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const reviewAssignment = async (req, res) => {
  const { assignmentId, adminComment } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (isMissing(assignmentId) || isMissing(adminComment)) {
    return res.status(400).json({ message: "assignmentId and adminComment are required" });
  }

  try {
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      workspaceId: req.user.workspaceId,
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.reviewStatus = "REVIEWED";
    assignment.reviewedAt = new Date();
    assignment.adminComment = adminComment;
    await assignment.save();

    return res.status(200).json({ message: "Assignment reviewed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const submitCheckIn = async (req, res) => {
  const { assignmentId, answers } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "EMPLOYEE") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (isMissing(assignmentId) || !Array.isArray(answers)) {
    return res.status(400).json({ message: "assignmentId and answers are required" });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (
      assignment.userId.toString() !== req.user._id.toString() ||
      assignment.workspaceId.toString() !== req.user.workspaceId.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Answer.deleteMany({ assignmentId: assignment._id });

    if (answers.length > 0) {
      await Answer.insertMany(
        answers.map(({ question, answer }) => ({
          assignmentId: assignment._id,
          question,
          answer,
          updatedAt: new Date(),
        }))
      );
    }

    const answerTexts = answers.map(({ answer }) => answer);
    const blockerTags = detectBlockerKeywords(answerTexts);
    const sentimentScore = calculateSentimentScore(answerTexts);

    assignment.status = "SUBMITTED";
    assignment.blockerTags = blockerTags;
    assignment.sentimentScore = sentimentScore;
    assignment.submittedAt = new Date();
    await assignment.save();

    return res.status(200).json({ message: "Check-in submitted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
