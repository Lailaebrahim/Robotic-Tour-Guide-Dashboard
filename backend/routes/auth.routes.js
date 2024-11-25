import { Router } from "express";
import {
  signUpUser,
  verifyEmail,
  loginUser,
  refreshAccessToken,
  logOutUser,
  accountCompletion,
} from "../controllers/auth.controller.js";
import uploadProfileMiddleware from "../utils/memberFileUploads.js";

const authRouter = Router();

authRouter.post("/signup", signUpUser);
authRouter.post("/verify-email", verifyEmail);
authRouter.post(
  "/complete-registration/:token",
  uploadProfileMiddleware,
  accountCompletion
);
authRouter.post("/login", loginUser);
authRouter.get("/refresh-token", refreshAccessToken);
authRouter.get("/logout", logOutUser);

export default authRouter;