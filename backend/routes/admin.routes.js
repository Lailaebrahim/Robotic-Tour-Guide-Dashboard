import { Router } from "express";
import {
  createNewMember,
  getTeam,
  getMember,
  giveControl,
  revokeControl,
  deleteMember,
} from "../controllers/admin.controller.js";
import isAuth from "../middlewares/auth/checkAuth.js";
import checkPermission from "../middlewares/auth/checkPermissions.js";
import { PERMISSIONS } from "../utils/userRolesPermissions.js";

const adminRouter = Router();

adminRouter.post(
  "/create-member",
  isAuth,
  checkPermission(PERMISSIONS.USERS.CREATE),
  createNewMember
);
adminRouter.get(
  "/team",
  isAuth,
  checkPermission(PERMISSIONS.USERS.READ),
  getTeam
);
adminRouter.get(
  "/member/:userId",
  isAuth,
  checkPermission(PERMISSIONS.USERS.READ),
  getMember
);
adminRouter.patch(
  "/give-control/:userId",
  isAuth,
  checkPermission(PERMISSIONS.USERS.CONTROL),
  giveControl
);
adminRouter.patch(
  "/revoke-control/:userId",
  isAuth,
  checkPermission(PERMISSIONS.USERS.CONTROL),
  revokeControl
);
adminRouter.delete(
  "/member/:userId",
  isAuth,
  checkPermission(PERMISSIONS.USERS.DELETE),
  deleteMember
);

export default adminRouter;
