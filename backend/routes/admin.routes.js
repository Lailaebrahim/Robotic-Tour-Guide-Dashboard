import { Router } from "express";
import {
  createNewMember,
  getTeam,
  getMember,
  giveControl,
  revokeControl,
  deleteMember,
} from "../controllers/admin.controller.js";
import checkAuth from "../middlewares/auth/checkAuth.js";
import checkPermission from "../middlewares/auth/checkPermissions.js";
import { PERMISSIONS } from "../utils/userRolesPermissions.js";

const adminRouter = Router();

adminRouter.post(
  "/create-member",
  checkAuth,
  checkPermission(PERMISSIONS.USERS.CREATE),
  createNewMember
);
adminRouter.get(
  "/team",
  checkAuth,
  checkPermission(PERMISSIONS.USERS.READ),
  getTeam
);
adminRouter.get(
  "/member/:userId",
  checkAuth,
  checkPermission(PERMISSIONS.USERS.READ),
  getMember
);
adminRouter.patch(
  "/give-control/:userId",
  checkAuth,
  checkPermission(PERMISSIONS.USERS.CONTROL),
  giveControl
);
adminRouter.patch(
  "/revoke-control/:userId",
  checkAuth,
  checkPermission(PERMISSIONS.USERS.CONTROL),
  revokeControl
);
adminRouter.delete(
  "/member/:userId",
  checkAuth,
  checkPermission(PERMISSIONS.USERS.DELETE),
  deleteMember
);

export default adminRouter;
