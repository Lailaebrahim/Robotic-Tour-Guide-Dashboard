import { userRoles } from "../../utils/userRolesPermissions.js";

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
      try {
        const user = req.user; // user is attached by previous isAuth middleware
        
        if (!user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
  
        // Check if user has admin role (all permissions)
        if (user.role === userRoles.ADMIN) {
          return next();
        }

        const userPermissions = user.permissions;
        if (userPermissions.includes(requiredPermission)) {
          next();
        } else {
          res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

      } catch (error) {
        next(error);
      }
      };
    
};

export default checkPermission;