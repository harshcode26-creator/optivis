import Assignment from "../models/Assignment.js";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";

export const getOverviewStats = async (_req, res) => {
  try {
    const [totalWorkspaces, totalUsers, totalCompletedCheckIns] = await Promise.all([
      Workspace.countDocuments(),
      User.countDocuments(),
      Assignment.countDocuments({ status: "SUBMITTED" }),
    ]);

    return res.status(200).json({
      totalWorkspaces,
      totalUsers,
      totalCompletedCheckIns,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCheckInStats = async (_req, res) => {
  try {
    const totalCompletedCheckIns = await Assignment.countDocuments({
      status: "SUBMITTED",
    });

    return res.status(200).json({ totalCompletedCheckIns });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
