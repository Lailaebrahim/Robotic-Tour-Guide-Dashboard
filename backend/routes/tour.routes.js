import { Router } from "express";
import isAuth from "../middlewares/auth/checkAuth.js";
import { PERMISSIONS } from "../utils/userRolesPermissions.js";
import checkPermission from "../middlewares/auth/checkPermissions.js";
import {
  getTours,
  createTour,
  updateTour,
  deleteTour,
  getTourById,
  generateTourAudio
} from "../controllers/tour.controller.js";
import checkId from "../middlewares/validators/checkId.js";

const tourRoutes = Router();

tourRoutes.param("id", checkId);

tourRoutes.get("", isAuth, checkPermission(PERMISSIONS.TOURS.READ), getTours);
tourRoutes.post(
  "",
  isAuth,
  checkPermission(PERMISSIONS.TOURS.WRITE),
  createTour
);
tourRoutes.patch(
  "/:id",
  isAuth,
  checkPermission(PERMISSIONS.TOURS.WRITE),
  updateTour
);
tourRoutes.delete(
  "/:id",
  isAuth,
  checkPermission(PERMISSIONS.TOURS.WRITE),
  deleteTour
);
tourRoutes.get(
  "/:id",
  isAuth,
  checkPermission(PERMISSIONS.TOURS.READ),
  getTourById
);
tourRoutes.patch(
  "/:id/generate-audio",
  isAuth,
  checkPermission(PERMISSIONS.TOURS.WRITE),
  generateTourAudio
);

export default tourRoutes;
