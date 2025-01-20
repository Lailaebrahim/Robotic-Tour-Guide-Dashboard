/**
 * @fileoverview This file contains the user roles and permissions for the application.
 * @constant {Object} userRoles - defines user roles.
 * @constant {Object} PERMISSIONS - defines permissions.
 * @constant {Object} rolePermissions - defines permissions for each role.
 */


const userRoles = Object.freeze({
    ADMIN: "admin",
    TOUR_MANAGER: "tourManager",
    ROBOT_OPERATOR: "robotOperator",
    CONTENT_MANAGER: "contentManager",
    USER: "user",
});

const PERMISSIONS = Object.freeze({
  USERS: {
    CREATE: "create:users", // create new team member
    READ: "read:users", // read team members data
    UPDATE: "update:users", // update team member data
    DELETE: "delete:users", // delete team member
    CONTROL: "control:users", // give or revoke control from robot operator
  },
  ROBOT: {
    READ: "read:robots", // read robot status data
    UPDATE: "update:robots", // update robot status
    CONTROL: "control:robots", // control robot movement
  },
  TOURS: {
    CREATE: "create:tours", // create new tour
    READ: "read:tours", // read tour data
    UPDATE: "update:tours", // update tour data
    DELETE: "delete:tours", // delete tour
    SCHEDULE: "schedule:tours", // schedule tour
  },
});

const rolePermissions = Object.freeze({
  [userRoles.ADMIN]: [
          ...Object.values(PERMISSIONS.USERS),
          ...Object.values(PERMISSIONS.ROBOT),
          ...Object.values(PERMISSIONS.TOURS),
  ],
  [userRoles.TOUR_MANAGER]: [
      ...Object.values(PERMISSIONS.TOURS),
      PERMISSIONS.USERS.READ,
      PERMISSIONS.ROBOT.READ,
  ],
  [userRoles.ROBOT_OPERATOR]: [
      ...Object.values(PERMISSIONS.ROBOT),
      PERMISSIONS.USERS.READ,
      PERMISSIONS.TOURS.READ,
  ],
  [userRoles.USER]: [],
});

export { userRoles, rolePermissions, PERMISSIONS };