import User from "../../modules/users/user.model.js";
import createError from "../../utils/createError.js";
import * as cookies from "../../utils/cookies.js";

//  middlewares: isAuthenticated
const loadUser =
  (selectFields = "") =>
  async (req, res, next) => {
    const query = selectFields ? User.findById(req.payload.userId).select(selectFields) : User.findById(req.payload.userId);
    const existingUser = await query;

    if (!existingUser) {
      await cookies.clearRefreshToken({ req, res });
      const err = new Error("Session expired or user no longer exists");
      err.statusCode = 401;
      return next(err);
    }

    req.user = existingUser;

    next();
  };

export default loadUser;
