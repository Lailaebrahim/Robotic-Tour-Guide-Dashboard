import { Router } from "express";
import {
  signUpUser,
  verifyEmail,
  loginUser,
  refreshAccessToken,
  logOutUser,
  accountCompletion,
  forgotPassword,
  resetPassword,
  checkAuth
} from "../controllers/auth.controller.js";
import {signUpValidator, loginValidator, completeAccountValidator} from "../middlewares/validators/authValidators.js";
import uploadProfileMiddleware from "../utils/memberFileUploads.js";
import isAuth from "../middlewares/auth/checkAuth.js";

const authRouter = Router();

// authRouter.post("/signup", signUpValidator, signUpUser);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/complete-registration/:token", completeAccountValidator, uploadProfileMiddleware, accountCompletion);
authRouter.post("/login", loginValidator, loginUser);
authRouter.get("/refresh-token", refreshAccessToken);
authRouter.get("/logout", isAuth, logOutUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);
authRouter.get("/check-auth", isAuth, checkAuth);

export default authRouter;
