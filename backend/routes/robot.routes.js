import { Router } from "express";
import {
  getConnectionStatus,
  getTopics,
  readClientsCount,
} from "../controllers/robot.controller.js";
import isAuth from "../middlewares/auth/checkAuth.js";
import checkPermission from "../middlewares/auth/checkPermissions.js";
import { PERMISSIONS } from "../utils/userRolesPermissions.js";


const robotRouter = Router();

robotRouter.get(
  "/connection-status",
  isAuth,
  checkPermission(PERMISSIONS.ROBOT.READ),
  getConnectionStatus
);
robotRouter.get(
  "/topics",
  isAuth,
  checkPermission(PERMISSIONS.ROBOT.READ),
  getTopics
);
robotRouter.get(
  "/client-count",
  isAuth,
  checkPermission(PERMISSIONS.ROBOT.READ),
  readClientsCount
);

export default robotRouter;
