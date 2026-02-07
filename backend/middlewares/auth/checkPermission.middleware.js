// RBAC
import { ROLES } from "../../constants/index.js";
import createError from "../../utils/createError.js";

const checkPermission = (permission) => {
  return (req, res, next) => {
    const roles = req.user.roles;

    if (!roles || !roles.length) return next(createError("No roles assigned", 403))

    const hasPermission = roles.some((role) => {
      const permissions = ROLES[role] || [];
      return permissions.includes(permission);
    });

    if (!hasPermission) return next(createError("FORBIDDEN", 403))

    next();
  };
};

module.exports = checkPermission;
