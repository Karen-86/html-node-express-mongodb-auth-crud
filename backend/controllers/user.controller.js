import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import UpdateEmailToken from "../models/updateEmailToken.model.js";
import VerifyEmailToken from "../models/verifyEmailToken.model.js";
import ResetPasswordToken from "../models/resetPasswordToken.model.js";
import AddPasswordToken from "../models/addPasswordToken.model.js";
import createError from "../utils/createError.js";
import { logout } from "./auth.controller.js";

// @GET: /users | middlewares: isAuthenticated
const getUsers = async (_, res, next) => {
  try {
    const users = await User.find().select("-createdAt -updatedAt");

    res.status(200).json({
      success: true,
      message: "all users",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @GET: /users/:id | middlewares: isAuthenticated, loadUser, loadResource
const getUser = async (req, res, next) => {

  const user = req.foundUser;

  try {
    res.status(200).json({
      success: true,
      message: "user found successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @PATCH: /users/:id | middlewares:  isAuthenticated, validate, loadUser, loadResource, isOwner
const updateUser = async (req, res, next) => {
  try {
    Object.assign(req.foundUser, req.filteredBody);
    const updatedUser = await req.foundUser.save();

    res.status(200).json({
      success: true,
      message: "user updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// @PATCH: /users/:id | middlewares:  isAuthenticated, loadUser, loadResource, checkRoleHierarchy
const deleteUser = async (req, res, next) => {
  // Required middlewares
  // - loadResource

  try {
    const user = req.foundUser;

    await user.deleteOne();

    let message = "User deleted successfully";

    await Promise.all([
      RefreshToken.findOneAndDelete({ userId: user._id }),
      VerifyEmailToken.deleteOne({ userId: user._id }),
      UpdateEmailToken.deleteOne({ userId: user._id }),
      ResetPasswordToken.deleteOne({ userId: user._id }),
      AddPasswordToken.deleteOne({ userId: user._id }),
    ]);

    if (req.user._id.toString() === user._id.toString()) {
      message = "Your account has been deleted successfully.";
      await logout(req, res, next, { silent: true });
    }

    res.status(200).json({
      success: true,
      message,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @PATCH: /users/update-user-by-admin/:id | middlewares:  isAuthenticated, validate, loadUser, checkRoleHierarchy
const updateUserByAdmin = async (req, res, next) => {
  try {
    const newRoles = req.filteredBody.roles
    if (newRoles.includes("superAdmin")) throw createError("Action forbidden: insufficient privileges.");
    req.foundUser.roles = newRoles
    await req.foundUser.save();

    res.status(200).json({
      success: true,
      message: "user updated successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export { getUsers, getUser, updateUser, deleteUser, updateUserByAdmin };
