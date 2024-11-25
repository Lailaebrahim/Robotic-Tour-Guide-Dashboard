import { Router } from "express";
import { signUpUser, verifyEmail, loginUser, refreshAccessToken, logOutUser} from "../controllers/auth.controller.js";

const authRouter = Router();


authRouter.post("/signup", signUpUser);
authRouter.post('/verify-email',verifyEmail);
authRouter.post("/login", loginUser);
authRouter.get("/refresh-token", refreshAccessToken);
authRouter.get("/logout", logOutUser);

export default authRouter;