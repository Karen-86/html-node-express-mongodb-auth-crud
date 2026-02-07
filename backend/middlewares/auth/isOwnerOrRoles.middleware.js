// middlewares:  isAuthenticated, loadUser, loadResource
const isOwnerOrRoles =
  ({ reqKey = "", allowedRoles = [] }) =>
  (req, _, next) => {

    let userId = req[reqKey]?.userId?.toString(); // resource owner
    if (!userId) userId = req.foundUser?._id?.toString(); // owner

    const isOwner = req.user._id.toString() === userId.toString();
    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!isOwner && !hasRole) {
      const err = new Error(`Forbidden: not owner and no allowed role`);
      err.statusCode = 403;
      return next(err);
    }

    next();
  };

export default isOwnerOrRoles;
