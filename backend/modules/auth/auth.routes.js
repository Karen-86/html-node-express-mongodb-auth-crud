import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  getProfile,
  updatePassword,
  addPassword,
  confirmAddPassword,
  updateEmail,
  verifyEmail,
  confirmUpdateEmail,
  confirmVerifyEmail,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback
} from "./auth.controller.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  registerUserSchema,
  loginUserSchema,
  updatePasswordSchema,
  addPasswordSchema,
  updateEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validator.js";
import loadUser from "../../middlewares/auth/loadUser.middleware.js";
import isAuthenticated from "../../middlewares/auth/isAuthenticated.middleware.js";
import { authLimiter, limiter } from "../../utils/rateLimiters.js";

const router = express.Router();

/* ---------- LIGHT LIMIT ---------- */
router.get("/me", limiter, isAuthenticated, loadUser(), getProfile);

/* ---------- HEAVY LIMIT ---------- */
router.use(authLimiter)

router.post("/register", validate(registerUserSchema), register);
router.post("/login", validate(loginUserSchema), login);
router.post("/refresh", refresh);
router.delete("/logout", isAuthenticated, loadUser(), logout);

router.patch("/update-password", isAuthenticated, validate(updatePasswordSchema), loadUser("+password -email"), updatePassword);

router.patch("/add-password", isAuthenticated, validate(addPasswordSchema), loadUser("+password"), addPassword);
router.patch("/confirm-add-password", confirmAddPassword);

router.patch("/verify-email", isAuthenticated, loadUser(), verifyEmail);
router.patch("/confirm-verify-email", confirmVerifyEmail);

router.patch("/update-email", isAuthenticated, validate(updateEmailSchema), loadUser("+password"), updateEmail);
router.patch("/confirm-update-email", confirmUpdateEmail);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

export default router;
