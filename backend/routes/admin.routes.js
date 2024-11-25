import { Router } from "express";
import { createNewMember} from "../controllers/admin.controller.js";
import checkAuth from "../middlewares/auth/checkAuth.js";
import checkPermission from "../middlewares/auth/checkPermissions.js";
import {PERMISSIONS }from "../utils/userRolesPermissions.js";


const adminRouter = Router(); 

adminRouter.post('/create-member', checkAuth, checkPermission(PERMISSIONS.USERS.CREATE), createNewMember);

export default adminRouter;