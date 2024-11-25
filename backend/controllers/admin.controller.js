import asyncHandler from "express-async-handler";
import AppError from "../utils/error.js";
import User from "../models/user.model.js";
import { rolePermissions, userRoles } from "../utils/userRolesPermissions.js";
import { generateVerificationToken } from "../utils/generateTokens.js";
import { sendMemberVerificationEmail } from "../mail/sendEmails.js";


export const createNewMember = asyncHandler(async (req, res, next) => {
  const { email, username, role } = req.body;
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const error = new AppError(400, "User already exists !");
    if (existingUser.email == email) {
      error.details = { email: "Email already registered !" };
    } else {
      error.details = { username: "Username already taken !" };
    }
    return next(error);
  }
  const user = new User({
    email,
    username,
    role,
    permissions: rolePermissions[role],
    hasControl: false,
    verificationToken: generateVerificationToken(),
    verificationTokenExpAt:
      Date.now() + parseInt(process.env.VERIFICATION_TOKEN_EXPIRY),
  });
  await user.save();
  await sendMemberVerificationEmail(
    user.username,
    user.email,
    user.verificationToken
  );

  res.status(201).jsend.success({
    message:
      "New member created and verfication email is sent to them successfully",
    email: user.email,
    username: user.username,
    status: user.status,
    role: user.role,
    verificationToken: user.verificationToken,
    verificationTokenExpAt: user.verificationTokenExpAt,
  });
});

export const getTeam = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const team = await User.find({ role: { $ne: userRoles.ADMIN } })
    .skip(skip)
    .limit(limit)
    .select("-password");
  if (!team) {
    return next(new AppError(404, "No team members found"));
  }
  res.status(200).jsend.success({ team });
});

export const getMember = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  const member = await User.findById(userId).select("-password");
  if (!member) {
    return next(new AppError(404, "Team member not found"));
  }
  res.status(200).jsend.success({ member });
});

export const giveControl = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  const user = await User.findOne({
    role: userRoles.ROBOT_OPERATOR,
    _id: userId,
  });
  if (!user) {
    return next(new AppError(404, "Robot Operator not found"));
  }

  if (user.hasControl) {
    return next(
      new AppError(400, `Robot Operator ${user.username} already has control`)
    );
  }

  // revoke control from the operator who has control
  const userHasControl = await User.findOne({
    role: userRoles.ROBOT_OPERATOR,
    hasControl: true,
    _id: { $ne: userId },
  });

  if (userHasControl) {
    userHasControl.hasControl = false;
    await userHasControl.save();
  }

  // give control to the desired operator
  user.hasControl = true;
  await user.save();

  res.status(200).jsend.success({ message: `Robot Operator ${user.username}  has control now` });
});

export const revokeControl = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  const user = await User.findOne({
    role: userRoles.ROBOT_OPERATOR,
    _id: userId,
  });
  if (!user) {
    return next(new AppError(404, "Operator not found"));
  }

  if (!user.hasControl) {
    return next(
      new AppError(400, `Robot Operator ${user.username} already doesn't have control`)
    );
  }

  user.hasControl = false;
  await user.save();

  res
    .status(200)
    .jsend.success({ message: `Robot Operator ${user.username}  doesn't have control now.` });
});

export const deleteMember = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError(404, "Team Member not found"));
  }
  await user.deleteOne();
  res
    .status(200)
    .jsend.success({ message: "Team Member deleted successfully" });
});
