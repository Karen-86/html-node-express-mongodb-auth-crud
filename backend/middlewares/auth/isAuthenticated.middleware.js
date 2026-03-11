import jwt from "jsonwebtoken";
// import User from "../../models/user.model.js";
import createError from "../../utils/createError.js";

const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) return next(createError('Unauthorized',401))

  // Pure auth
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
    if (error) {
      const err = new Error(error.message || "Invalid Token");
      err.statusCode = 401;
      return next(err);
    }
    req.payload = payload;
    next();
  });

  // // Auth + authorization
  // try {
  //   const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  //   const user = await User.findById(payload.userId);
  //   if (!user) return next(createError("User not found", 404))

  //   req.user = user; 
  //   next();
  // } catch (error) {
  //   const err = new Error(error.message || "Invalid Token");
  //   err.statusCode = 403;
  //   next(err);
  // }
};

export default isAuthenticated;




