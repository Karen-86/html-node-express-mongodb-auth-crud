
// middlewares:  loadUser, loadResource
const isResourceOwner =
  (reqKey = "resource") =>
  (req, _, next) => {

    const isResourceOwner = req.user._id.toString() === req[reqKey].userId.toString()

    if (!isResourceOwner) {
      const err = new Error(`You are not the owner of this ${reqKey}`);
      err.statusCode = 403;
      return next(err);
    }

    next();
  };

export default isResourceOwner;
