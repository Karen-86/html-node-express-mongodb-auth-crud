// RBAC

// middlewares: loadUser
const allowRoles =
  (...allowedRoles) =>
  (req, _, next) => {

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    
    if (!hasRole) {
      const err = new Error("Forbidden: no allowed role");
      err.statusCode = 403;
      return next(err);
    }

    next();
  };

export default allowRoles;
