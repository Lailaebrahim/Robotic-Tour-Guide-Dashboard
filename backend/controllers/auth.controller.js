import asyncHandler from "express-async-handler";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import AppError from "../utils/error.js";
import path from "path";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendAccountCompletionEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} from "../mail/sendEmails.js";
import {
  generateVerificationToken,
  generateTokensSetCookie,
  generateAccessRefreshToken,
  generateActivationToken,
} from "../utils/generateTokens.js";
import { userRoles, rolePermissions } from "../utils/userRolesPermissions.js";

export const signUpUser = asyncHandler(async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errorMessages = result.array().map(error => error.msg).join("\n");
    return next(new AppError(400, errorMessages));
  }
  const { firstName, lastName, email, username, password, role } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const error = new AppError(400, "User exists, ");
    if (existingUser.email == email) {
      error.message += "Email already registered !";
    } else {
      error.message += "Username taken !";
    }
    return next(error);
  }

  const hashedPassword = await bcryptjs.hash(
    password,
    parseInt(process.env.SALT)
  );

  const user = new User({
    firstName,
    lastName,
    email,
    username,
    password: hashedPassword,
    role,
    permissions: rolePermissions[role],
    verificationToken: generateVerificationToken(),
    verificationTokenExpAt:
      Date.now() + parseInt(process.env.VERIFICATION_TOKEN_EXPIRY),
  });

  await user.save();

  await sendVerificationEmail(user.email, user.verificationToken);

  res.status(201).send({
    message:
      "User created successfully, please check your email for verification",
    user,
    verificationToken: user.verificationToken,
    verificationTokenExpAt: user.verificationTokenExpAt,
  });
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { verificationToken } = req.body;
  const user = await User.findOne({
    verificationToken: verificationToken,
  });
  if (!user) {
    return next(new AppError(400, "Invalid verification token"));
  }
  let activationToken;
  if (
    user.role == userRoles.ROBOT_OPERATOR ||
    user.role == userRoles.TOUR_MANAGER
  ) {
    user.status = "pending";
    activationToken = generateActivationToken(user);
    await sendAccountCompletionEmail(user.email, activationToken);
  } else {
    user.status = "active";
    await sendWelcomeEmail(user.email, user.username);
  }
  user.verificationToken = undefined;
  user.verificationTokenExpAt = undefined;
  await user.save();
  res.jsend.success({
    message: "Email verified successfully",
    activationToken: activationToken,
    user,
  });
});

export const accountCompletion = asyncHandler(async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errorMessages = result.array().map(error => error.msg).join("\n");
    return next(new AppError(400, errorMessages));
  }
  const { firstName, lastName, password } = req.body;
  const activationToken = req.params.token;
  if (!activationToken) {
    return next(new AppError(400, "Activation token is required"));
  }
  try {
    const decodedJWT = jwt.verify(
      activationToken,
      process.env.ACTIVATION_TOKEN_SECRET_KEY
    );
    const user = await User.findById(decodedJWT._id);
    if (!user) return next(new AppError(403, "Forbidden No user found"));
    if (user.status != "pending") return next(
      new AppError(403, "Invalid activation token")
    );

    user.firstName = firstName;
    user.lastName = lastName;
    user.password = await bcryptjs.hash(password, parseInt(process.env.SALT));
    const profilePath = req.file
      ? path.join("uploads/userProfile", req.file.filename)
      : null;
    if (profilePath) user.profile = profilePath;
    user.status = "active";
    await user.save();

    await sendWelcomeEmail(user.email, user.username);

    res.jsend.success({
      message:
        "Your Account Creation is Completed Successfully! You can login to your account now.",
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError(401, "Activation token expired request another one"));
    } else {
      return next(
        new AppError(403, "Forbidden Invalid activation token: " + err.message)
      );
    }
  }
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errorMessages = result.array().map(error => error.msg).join("\n");
    return next(new AppError(400, errorMessages));
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(400, "No user found with this email"));
  }
  if (user.status !== "active") {
    return next(new AppError(401, "Account is not active yet"));
  }
  const isPasswordCorrect = await bcryptjs.compare(password, user.password);
  if (!isPasswordCorrect) {
    return next(new AppError(400, "Incorrect Password"));
  }
  // Generate tokens and set cookie
  const { refreshToken, accessToken } = generateTokensSetCookie(user, res);
  user.refreshToken = refreshToken;
  user.lastLogin = Date.now();
  await user.save();
  const userWithoutSensitiveInfo = user.toObject();
  delete userWithoutSensitiveInfo.password;
  delete userWithoutSensitiveInfo.activationToken;

  res.jsend.success({
    message: "Login successful",
    accessToken,
    user: userWithoutSensitiveInfo
  });
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const { JWT } = req.cookies;
  if (!JWT) {
    return next(new AppError(401, "Unauthorized No refresh token found"));
  }
  try {
    const decodedJWT = jwt.verify(JWT, process.env.REFRESH_TOKEN_SECRET_KEY);
    const user = await User.findById(decodedJWT._id);
    if (!user) return next(new AppError(403, "Forbidden No user found"));
    if (user.status !== "active")
      return next(new AppError(403, "Forbidden User not active"));
    const { accessToken, _ } = generateAccessRefreshToken(user);
    res.jsend.success({ user, accessToken: accessToken });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        new AppError(401, "Refresh token expired please login again")
      );
    } else {
      return next(new AppError(403, "Forbidden Invalid refresh token"));
    }
  }
});

export const logOutUser = asyncHandler(async (req, res, next) => {
  const JWT = req.cookies.JWT;
  try {
    const decodedJWT = jwt.verify(JWT, process.env.REFRESH_TOKEN_SECRET_KEY);
    const user = await User.findById(decodedJWT._id);
    if (!user) {
      return next(new AppError(403, "Forbidden"));
    }
    user.refreshToken = undefined;
    await user.save();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        new AppError(401, "Refresh token expired please login again")
      );
    } else {
      return next(new AppError(403, "Forbidden Invalid refresh token"));
    }
  }
  res.clearCookie("JWT");
  req.user = null;
  res.jsend.success({ message: "Logout successful" });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(400, "No user found with this email"));
  }
  const { accessToken, _ } = generateAccessRefreshToken(user);
  user.resetPasswordToken = accessToken;
  user.resetPasswordTokenExpAt =
    Date.now() + parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY);

  await user.save();

  await sendPasswordResetEmail(user.email, user.resetPasswordToken);

  res.jsend.success({
    message: "Password reset email sent successfully",
    resetPasswordToken: user.resetPasswordToken,
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const password = req.body.password;
  const token = req.params.token;
  if (!password) {
    return next(new AppError(400, "Password is required"));
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpAt: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError(400, "Invalid reset token"));
  }
  user.password = await bcryptjs.hash(password, parseInt(process.env.SALT));
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpAt = undefined;

  await user.save();

  await sendPasswordResetSuccessEmail(user.email);

  res.jsend.success({ message: "Password reset successfully" });
});

export const checkAuth = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError(401, "Unauthorized no req.user"));
  }
  const user = await User.findById(req.user.id).select("-password").select("-refreshToken");
  if (!user) {
    return next(new AppError(401, "Unauthorized no user"));
  }
  res.jsend.success({ message: "Authorized", user });
});