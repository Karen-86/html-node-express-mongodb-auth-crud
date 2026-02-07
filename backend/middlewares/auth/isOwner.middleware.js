// middlewares: loadUser, loadResource
const isOwner = async (req, _, next) => {

  const isOwner = req.user._id.toString() === req.foundUser._id.toString()
  
  if (!isOwner) {
    const err = new Error("You are not the owner");
    err.statusCode = 403;
    return next(err);
  }

  next();
};

export default isOwner;
