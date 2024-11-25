import asyncHandler from "express-async-handler";
import AppError from "../utils/error.js";
import User from "../models/user.model.js";
import { rolePermissions} from "../utils/userRolesPermissions.js";
import { generateVerificationToken } from "../utils/generateTokens.js";
import { sendMemberVerificationEmail } from "../mail/sendEmails.js";

export const createNewMember = asyncHandler(async (req, res, next) => {
    const { email, username, role} = req.body;
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
      verificationTokenExpAt: Date.now() + parseInt(process.env.VERIFICATION_TOKEN_EXPIRY),
    });
    await user.save();
    await sendMemberVerificationEmail(user.username, user.email, user.verificationToken);
  
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