import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";

const JWT_EXPIRES_IN = "7d";

const createToken = (user) => {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      workspaceId: user.workspaceId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const isMissing = (value) => !value || !String(value).trim();

const buildAuthPayload = (user, extra = {}) => ({
  token: createToken(user),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    workspaceId: user.workspaceId,
  },
  ...extra,
});

export const createWorkspace = async (req, res) => {
  const { name, email, password, workspaceName } = req.body;

  if ([name, email, password, workspaceName].some(isMissing)) {
    return res.status(400).json({ message: "name, email, password, and workspaceName are required" });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const workspace = await Workspace.create({
      name: workspaceName,
    });

    const user = await User.create({
      name,
      email,
      password,
      role: "ADMIN",
      workspaceId: workspace._id,
    });

    workspace.createdBy = user._id;
    await workspace.save();

    return res.status(201).json(buildAuthPayload(user, {
      workspaceSlug: workspace.slug,
      joinCode: workspace.joinCode,
    }));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const joinWorkspace = async (req, res) => {
  const { name, email, password, workspaceSlug, joinCode } = req.body;

  if ([name, email, password, workspaceSlug, joinCode].some(isMissing)) {
    return res.status(400).json({ message: "name, email, password, workspaceSlug, and joinCode are required" });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const workspace = await Workspace.findOne({ slug: workspaceSlug.toLowerCase() });

    if (!workspace || workspace.joinCode !== joinCode.toUpperCase()) {
      return res.status(400).json({ message: "Invalid workspace or join code" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "EMPLOYEE",
      workspaceId: workspace._id,
    });

    return res.status(201).json(buildAuthPayload(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some(isMissing)) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json(buildAuthPayload(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
