import mongoose from "mongoose";
import {userRoles} from "../utils/userRolesPermissions.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    profile:{
      type: String,
      default: `/uploads/userProfile/default.jpg`,
    },
    role: {
      type: String,
      enum: userRoles,
      required: true,
    },
    hasControl:{
      type: Boolean,
    },
    permissions: {
      type: [String],
      required: true,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpAt: { 
      type: Date,
    },
    status: {
      type: String,
      enum : ["notVerified", "pending", "active"],
      default: "notVerified"
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpAt: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
