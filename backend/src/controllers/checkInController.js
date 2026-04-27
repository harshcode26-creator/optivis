import Answer from "../models/Answer.js";
import Assignment from "../models/Assignment.js";
import CheckIn from "../models/CheckIn.js";
import Notification from "../models/Notification.js";
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

export const getMyStreak = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "EMPLOYEE") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const assignments = await Assignment.find({
      userId: req.user.userId || req.user._id,
      workspaceId: req.user.workspaceId,
      status: "SUBMITTED",
    })
      .select("submittedAt")
      .sort({ submittedAt: -1 });

    if (assignments.length === 0) {
      return res.status(200).json({ currentStreak: 0 });
    }

    let streak = 0;
    let previousSubmittedAt = null;

    for (const assignment of assignments) {
      const currentSubmittedAt = assignment.submittedAt
        ? new Date(assignment.submittedAt)
        : null;

      if (!currentSubmittedAt || Number.isNaN(currentSubmittedAt.getTime())) {
        continue;
      }

      if (!previousSubmittedAt) {
        streak += 1;
        previousSubmittedAt = currentSubmittedAt;
        continue;
      }

      const diffMs = previousSubmittedAt.getTime() - currentSubmittedAt.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays <= 7) {
        streak += 1;
        previousSubmittedAt = currentSubmittedAt;
      } else {
        break;
      }
    }

    return res.status(200).json({ currentStreak: streak });
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
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalCheckInsCreated,
      totalAssignments,
      submittedCount,
      reviewedCount,
      submittedAssignmentsForBlockers,
      assignmentsWithSentiment,
    ] = await Promise.all([
      CheckIn.countDocuments({ workspaceId }),
      Assignment.countDocuments({ workspaceId }),
      Assignment.countDocuments({ workspaceId, status: "SUBMITTED" }),
      Assignment.countDocuments({ workspaceId, reviewStatus: "REVIEWED" }),
      Assignment.find({
        workspaceId,
        status: "SUBMITTED",
        createdAt: { $gte: sevenDaysAgo },
      }).select("blockerTags"),
      Assignment.find({
        workspaceId,
        sentimentScore: { $exists: true, $ne: null },
      }).select("sentimentScore"),
    ]);

    const allTags = [];

    submittedAssignmentsForBlockers.forEach((assignment) => {
      if (assignment.blockerTags && assignment.blockerTags.length) {
        allTags.push(...assignment.blockerTags);
      }
    });

    const normalizedTags = allTags
      .map((tag) => String(tag || "").trim().toLowerCase())
      .filter(Boolean);

    const blockerSummary = {};

    normalizedTags.forEach((tag) => {
      blockerSummary[tag] = (blockerSummary[tag] || 0) + 1;
    });

    const blockers = Object.keys(blockerSummary);

    const totalSentiment = assignmentsWithSentiment.reduce(
      (sum, assignment) => sum + (assignment.sentimentScore || 0),
      0
    );

    const averageSentiment =
      assignmentsWithSentiment.length > 0 ? totalSentiment / assignmentsWithSentiment.length : 0;

    const basicInsights = {
      totalCheckInsCreated,
      totalAssignments,
      submittedCount,
      reviewedCount,
      blockers,
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
      summary: llmInsights.summary,
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

  if (!["ADMIN", "EMPLOYEE"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (isMissing(assignmentId)) {
    return res.status(400).json({ message: "assignmentId is required" });
  }

  try {
    console.log("USER:", req.user);

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      workspaceId: req.user.workspaceId,
    })
      .populate("userId", "name email")
      .populate("checkInId", "title questions");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (
      req.user.role === "EMPLOYEE" &&
      assignment.userId?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
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
    }).populate("checkInId", "title");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.reviewStatus = "REVIEWED";
    assignment.reviewedAt = new Date();
    assignment.adminComment = adminComment;
    await assignment.save();

    await Notification.create({
      userId: assignment.userId,
      type: "CHECKIN_REVIEWED",
      message: `Your check-in "${assignment.checkInId?.title || "Check-in"}" was reviewed`,
      assignmentId: assignment._id,
    });

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
    const blockerTags = detectBlockerKeywords(answerTexts).map((tag) =>
      String(tag || "").trim().toLowerCase()
    );
    const sentimentScore = calculateSentimentScore(answerTexts);

    assignment.status = "SUBMITTED";
    assignment.blockerTags = blockerTags;
    assignment.sentimentScore = sentimentScore;
    assignment.submittedAt = new Date();
    await assignment.save();

    const admins = await User.find({
      workspaceId: req.user.workspaceId,
      role: "ADMIN",
    }).select("_id");

    await Promise.all(
      admins.map((admin) =>
        Notification.create({
          userId: admin._id,
          type: "CHECKIN_SUBMITTED",
          assignmentId: assignment._id,
          message: "New check-in submitted",
        })
      )
    );

    return res.status(200).json({ message: "Check-in submitted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
