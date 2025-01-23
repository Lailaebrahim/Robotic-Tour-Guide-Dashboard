import { Router } from "express";
import {
  createNewMember,
  getTeam,
  getMember,
  giveControl,
  revokeControl,
  deleteMember,
  updateMember,
} from "../controllers/admin.controller.js";
import isAuth from "../middlewares/auth/checkAuth.js";
import checkPermission from "../middlewares/auth/checkPermissions.js";
import { PERMISSIONS } from "../utils/userRolesPermissions.js";
import checkId from "../middlewares/validators/checkId.js";

const adminRouter = Router();

adminRouter.param("id", checkId);

adminRouter.post("/create-member", isAuth, checkPermission(PERMISSIONS.USERS.CREATE), createNewMember);
adminRouter.get("/team", isAuth, checkPermission(PERMISSIONS.USERS.READ), getTeam);
adminRouter.get("/member/:id", isAuth, checkPermission(PERMISSIONS.USERS.READ), getMember);
adminRouter.patch("/member/:id", isAuth, checkPermission(PERMISSIONS.USERS.UPDATE), updateMember);
adminRouter.patch("/give-control/:id", isAuth, checkPermission(PERMISSIONS.USERS.CONTROL), giveControl);
adminRouter.patch("/revoke-control/:id", isAuth, checkPermission(PERMISSIONS.USERS.CONTROL), revokeControl);
adminRouter.delete("/member/:id", isAuth, checkPermission(PERMISSIONS.USERS.DELETE), deleteMember);

export default adminRouter;
