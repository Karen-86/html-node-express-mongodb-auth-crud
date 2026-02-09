import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshToken.model.js";
import UpdateEmailToken from "../models/updateEmailToken.model.js";
import VerifyEmailToken from "../models/verifyEmailToken.model.js";
import ResetPasswordToken from "../models/resetPasswordToken.model.js";
import AddPasswordToken from "../models/addPasswordToken.model.js";
import createError from "../utils/createError.js";
import sendEmail from "../services/email.service.js";
import * as cookies from "../utils/cookies.js";
import { OAuth2Client } from "google-auth-library";
import mongoose from "mongoose";

const MAX_SESSION_LIFETIME = 7 * 24 * 60 * 60 * 1000; // 7 days
const ACCESS_TOKEN_LIFETIME = "15m"; // 15 min
const REFRESH_TOKEN_LIFETIME = "1d"; // 1 day

// @POST: /auth/register | middlewares: validate
const register = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const duplicate = await User.findOne({ email: req.filteredBody.email }).select("+password");
    if (duplicate && !duplicate.password)
      throw createError("This account uses Google Sign-In. Please log in with Google.", 400);

    if (duplicate) throw createError("Email already exists", 409);

    const hashedPassword = await bcrypt.hash(req.filteredBody.password, 10);

    const [createdUser] = await User.create([{ ...req.filteredBody, password: hashedPassword }], { session });

    const accessToken = jwt.sign({ userId: createdUser._id.toString() }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_LIFETIME,
    });
    const refreshToken = jwt.sign({ userId: createdUser._id.toString() }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_LIFETIME,
    });

    // CREATE REFRESHTOKEN DOCUMENT
    await RefreshToken.deleteOne({ userId: createdUser._id }).session(session);
    await RefreshToken.create(
      [
        {
          token: refreshToken,
          userId: createdUser._id,
          userEmail: createdUser.email,
          expiresAt: Date.now() + MAX_SESSION_LIFETIME,
        },
      ],
      { session },
    );
    //

    await session.commitTransaction();

    const { password, ...filteredUser } = createdUser.toObject();
    req.user = filteredUser;

    await verifyEmail(req, res, next, { silent: true });
    await cookies.createRefreshToken({ res, refreshToken, maxAge: MAX_SESSION_LIFETIME });

    res.status(201).json({
      success: true,
      message: "User created successfully | Confirmation email sent",
      data: filteredUser,
      accessToken,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};



// @POST: /auth/login | middlewares: validate
const login = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.filteredBody.email }).select("+password");

    if (!existingUser) throw createError("Invalid credentials", 401);

    if (!existingUser.password)
      throw createError("This email is linked to Google sign-in. Please continue with Google.", 400);

    const isMatch = await bcrypt.compare(req.filteredBody.password, existingUser.password);

    if (!isMatch) throw createError("Invalid credentials", 401);

    const { password, ...filteredUser } = existingUser.toObject();

    const accessToken = jwt.sign({ userId: filteredUser._id.toString() }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_LIFETIME,
    });
    const refreshToken = jwt.sign({ userId: filteredUser._id.toString() }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_LIFETIME,
    });

    await RefreshToken.deleteOne({ userId: filteredUser._id });
    await RefreshToken.create({
      token: refreshToken,
      userId: filteredUser._id,
      userEmail: filteredUser.email,
      expiresAt: Date.now() + MAX_SESSION_LIFETIME,
    });

    await cookies.createRefreshToken({ res, refreshToken, maxAge: MAX_SESSION_LIFETIME });

    res.status(200).json({
      success: true,
      message: "user logged in successfully",
      data: filteredUser,
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// @POST: /auth/refresh | middlewares: -
const refresh = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) throw createError("Session expired, please login again (cookies missing)", 401);

    let payload = null;
    try {
      payload = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") throw createError("Token expired, please login again", 403);

      throw createError(jwtError.message || "Invalid refresh token", 403);
    }

    const refreshTokenDoc = await RefreshToken.findOne({ token: oldRefreshToken, userId: payload.userId });

    if (!refreshTokenDoc) throw createError("Session expired, please login again (document missing 1)", 401);

    if (refreshTokenDoc.expiresAt < Date.now())
      throw createError("Session expired, please login again (document missing 2)", 401);

    const newAccessToken = jwt.sign({ userId: refreshTokenDoc.userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_LIFETIME,
    });
    const newRefreshToken = jwt.sign({ userId: refreshTokenDoc.userId }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_LIFETIME,
    });

    refreshTokenDoc.token = newRefreshToken;
    await refreshTokenDoc.save();

    const cookieMaxAge = refreshTokenDoc.expiresAt - Date.now();
    await cookies.createRefreshToken({ res, refreshToken: newRefreshToken, maxAge: cookieMaxAge });

    res.send({
      success: true,
      message: "Session updated",
      accessToken: newAccessToken,
      data: null,
    });
  } catch (err) {
    const oldRefreshToken = req.cookies.refreshToken;
    if (oldRefreshToken) {
      await cookies.clearRefreshToken({ res });
      await RefreshToken.deleteOne({ token: oldRefreshToken });
    }
    next(err);
  }
};

// @DELETE: /auth/logout | middlewares: isAuthenticated, loadUser
const logout = async (req, res, next, { silent = false } = {}) => {
  try {
    await cookies.clearRefreshToken({ res });

    await RefreshToken.findOneAndDelete({ userId: req.user._id });

    if (silent) return;
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// @GET: /auth/me | middlewares: isAuthenticated, loadUser
const getProfile = async (req, res, next) => {
  const me = req.user;

  try {
    res.status(200).json({
      success: true,
      message: "user found successfully",
      data: me,
    });
  } catch (err) {
    next(err);
  }
};

// @PATCH: /auth/update-password | middlewares: isAuthenticated, validate, loadUser
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.filteredBody;

    const user = req.user;

    if (!user.password) throw createError("This email is linked to Google sign-in. Please continue with Google.", 400);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw createError("Current password is incorrect", 400);

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    // Logout user (invalidate session)
    await logout(req, res, next, { silent: true });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// @PATCH: /auth/add-password | middlewares: isAuthenticated, validate, loadUser
const addPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.filteredBody;

    const user = req.user;

    const hasPassword = !!user.password;
    if (hasPassword) throw createError("User already have password", 400);

    user.emailVerified = false;
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    await AddPasswordToken.deleteOne({ userId: user._id });
    await AddPasswordToken.create({
      userId: user._id,
      userEmail: user.email,
      token: hashedToken,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24hr
    });

    const confirmUrl = `${process.env.CLIENT_URL}/auth/action/confirm-add-password?mode=addPassword&oobCode=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Confirm your password",
      html: `Hello ${user.name},<br/><br/>
      Follow this link to verify your email address.<br/><br/>
      <a href="${confirmUrl}">${confirmUrl}</a> <br/><br/>
      If you didn’t ask to verify this address, you can ignore this email. <br/><br/>`,
    });

    const { password, ...filteredUser } = user.toObject();

    // Logout user (invalidate session)
    await logout(req, res, next, { silent: true });

    res.status(200).json({
      success: true,
      message: "Confirmation email sent",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// @PATCH: /auth/confirm-add-password | middlewares: -
const confirmAddPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) throw createError("Missing verification token", 400);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const addPasswordToken = await AddPasswordToken.findOne({ token: hashedToken });

    // const errorMessage = `Try adding password again | Your request to add  password has expired or the link has already been used`
    if (!addPasswordToken) throw createError("Try adding password again | Invalid or expired verification token", 400);
    if (addPasswordToken.expiresAt.getTime() < Date.now())
      throw createError("Try adding password again | Verification token has expired", 400); // in case if MongoDB dont autodelete the emailToken

    const user = await User.findById(addPasswordToken.userId);
    if (!user) throw createError("User not found", 404);

    user.emailVerified = true;
    await user.save();

    await AddPasswordToken.deleteOne({ userId: user._id });

    const { password, ...filteredUser } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Password added successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// @PATCH: /auth/verify-email | middlewares: isAuthenticated, loadUser
const verifyEmail = async (req, res, next, { silent = false } = {}) => {
  try {
    const user = req.user;
    if (user.emailVerified) throw createError("Email already verified", 400);

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    await VerifyEmailToken.deleteOne({ userId: user._id });
    await VerifyEmailToken.create({
      userId: user._id,
      userEmail: user.email,
      token: hashedToken,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24hr
    });

    const confirmUrl = `${process.env.CLIENT_URL}/auth/action/confirm-verify-email?mode=verifyEmail&oobCode=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Confirm your email",
      html: `Hello ${user.name},<br/><br/> Follow this link to verify your email address. <br/><br/>
      <a href="${confirmUrl}">${confirmUrl}</a> <br/><br/>
      If you didn’t ask to verify this address, you can ignore this email. <br/><br/>
      Thanks
      `,
    });

    if (silent) return;
    res.status(200).json({
      success: true,
      message: "Confirmation email sent",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// @PATCH: /auth/confirm-verify-email | middlewares: -
const confirmVerifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) throw createError("Missing verification token", 400);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const verifyemailToken = await VerifyEmailToken.findOne({ token: hashedToken });

    // const errorMessage = `Try verifying your email again | Your request to verify your email has expired or the link has already been used`

    if (!verifyemailToken)
      throw createError("Try verifying your email again | Invalid or expired verification token", 400);
    if (verifyemailToken.expiresAt.getTime() < Date.now())
      throw createError("Try verifying your email again | Verification token has expired", 400); // in case if MongoDB dont autodelete the emailToken

    const user = await User.findById(verifyemailToken.userId);
    if (!user) throw createError("User not found", 404);

    user.emailVerified = true;
    await user.save();

    await VerifyEmailToken.deleteOne({ _id: verifyemailToken._id });

    const { password, ...filteredUser } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Your email has been verified",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// @PATCH: /auth/update-email | middlewares: isAuthenticated, validate, loadUser
const updateEmail = async (req, res, next) => {
  try {
    const { newEmail } = req.filteredBody;

    const user = req.user;
    //  const hasPassword = !!user.password;

    const hasGoogle = user.providerData?.some((p) => p.provider === "google");
    if (hasGoogle)
      throw createError(
        "This email is managed by Google. To change it, please update your email in your Google account.",
        400,
      );

    if (newEmail === user.email) throw createError("New email must be different", 400);

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    await UpdateEmailToken.deleteOne({ userId: user._id });
    await UpdateEmailToken.create({
      userId: user._id,
      userEmail: user.email,
      newEmail: newEmail,
      token: hashedToken,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24hr
    });

    const confirmUrl = `${process.env.CLIENT_URL}/auth/action/confirm-update-email?mode=verifyAndChangeEmail&oobCode=${token}`;

    await sendEmail({
      to: newEmail,
      subject: "Confirm your new email",
      html: `Hello ${user.name},<br/><br/>
      Follow this link to verify your new email address.<br/><br/>
      <a href="${confirmUrl}">${confirmUrl}</a> <br/><br/>
      If you didn’t ask to verify this address, you can ignore this email. <br/><br/>`,
    });

    const { password, ...filteredUser } = user.toObject();
    res.status(200).json({
      success: true,
      message: "Confirmation email sent",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// @PATCH: /auth/confirm-update-email | middlewares: -
const confirmUpdateEmail = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { token } = req.query;
    if (!token) throw createError("Missing verification token", 400);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const updateEmailToken = await UpdateEmailToken.findOne({ token: hashedToken }).session(session);

    // const errorMessage = `Try updating your email again | Your request to update your email has expired or the link has already been used`

    if (!updateEmailToken)
      throw createError("Try updating your email again | Invalid or expired verification token", 400);
    if (updateEmailToken.expiresAt.getTime() < Date.now())
      throw createError("Try updating your email again | Verification token has expired", 400); // in case if MongoDB dont autodelete the emailToken

    const user = await User.findById(updateEmailToken.userId).session(session);
    if (!user) throw createError("User not found", 404);

    if (!updateEmailToken.newEmail) throw createError("Invalid email change request", 400);

    const duplicate = await User.findOne({ email: updateEmailToken.newEmail }).session(session);
    if (duplicate) throw createError("Email already in use", 409);

    user.email = updateEmailToken.newEmail;
    user.emailVerified = true;
    await user.save({ session });

    await Promise.all([
      VerifyEmailToken.deleteOne({ userId: user._id }).session(session),
      UpdateEmailToken.deleteOne({ userId: user._id }).session(session),
    ]);

    await session.commitTransaction();

    const { password, ...filteredUser } = user.toObject();
    res.status(200).json({
      success: true,
      message: "Your email has been verified and changed",
      data: null,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// @POST: /auth/forgot-password | middlewares: validate
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.filteredBody;

    const existingUser = await User.findOne({ email });

    if (!existingUser) throw createError("Invalid credentials", 401);

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    await ResetPasswordToken.deleteOne({ userId: existingUser._id });
    await ResetPasswordToken.create({
      userId: existingUser._id,
      userEmail: existingUser.email,
      token: hashedToken,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24hr
    });

    const confirmUrl = `${process.env.CLIENT_URL}/auth/action/reset-password?mode=resetPassword&oobCode=${token}`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `Hello ${existingUser.name},<br/><br/>
      Follow this link to reset your password for your ${email} account.
      <br/><br/> <a href="${confirmUrl}">${confirmUrl}</a>`,
    });

    const { password, ...filteredUser } = existingUser.toObject();

    res.status(200).json({
      success: true,
      message: "Confirmation email sent",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// @POST: /auth/reset-password | middlewares: validate
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) throw createError("Missing verification token", 400);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetPasswordToken = await ResetPasswordToken.findOne({ token: hashedToken });

    // const errorMessage = `Try reseting your password again | Your request to reset your password has expired or the link has already been used`
    if (!resetPasswordToken)
      throw createError("Try reseting your password again | Invalid or expired verification token", 400);
    if (resetPasswordToken.expiresAt.getTime() < Date.now())
      throw createError("Try reseting your password again | Verification token has expired", 400); // in case if MongoDB dont autodelete the emailToken

    const user = await User.findById(resetPasswordToken.userId);
    if (!user) throw createError("User not found", 404);

    const { newPassword } = req.filteredBody;

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    await cookies.clearRefreshToken({ res });

    await ResetPasswordToken.deleteOne({ userId: user._id });

    const { password, ...filteredUser } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// @GET: /auth/google | middlewares: -
const googleAuth = async (req, res, next) => {
  try {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.SERVER_URL}/api/v1/auth/google/callback`,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
    });

    res.redirect("https://accounts.google.com/o/oauth2/v2/auth?" + params.toString());
  } catch (err) {
    next(err);
  }
};

// @GET: /auth/google-callback | middlewares: -
const googleCallback = async (req, res, next) => {
  try {
    const code = req.query.code;

    if (!code) throw createError("Google auth cancelled", 400);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.SERVER_URL}/api/v1/auth/google/callback`,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.id_token) throw createError("Google auth failed", 401);

    const { id_token } = tokenData;

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let existingUser = await User.findOne({ email: payload.email });

    if (!existingUser)
      existingUser = await User.findOne({
        "providerData.providerId": "google",
        "providerData.uid": payload.sub,
      });

    const googleProvider = {
      displayName: payload.name,
      email: payload.email,
      photoURL: payload.picture,
      providerId: "google",
      uid: payload.sub,
    };

    if (existingUser) {
      if (!existingUser.emailVerified && existingUser.password) existingUser.password = null;
      if (!existingUser.emailVerified) existingUser.emailVerified = true;
      if (!existingUser.avatar) existingUser.avatar = payload.picture;

      existingUser.providerData = existingUser.providerData || [];

      const hasGoogle = existingUser.providerData.some((p) => p.providerId === "google" && p.uid === payload.sub);

      if (hasGoogle) {
        existingUser.providerData = existingUser.providerData.map((p) =>
          p.providerId === "google" && p.uid === payload.sub ? { ...p, ...googleProvider } : p,
        );
      } else {
        existingUser.providerData.push(googleProvider);
      }

      await existingUser.save();
    }

    let createdUser = null;

    if (!existingUser) {
      createdUser = await User.create({
        name: payload.name,
        email: payload.email,
        age: null,
        avatar: payload.picture,
        emailVerified: true,
        providerData: [googleProvider],
      });
    }

    const { password, ...filteredUser } = (existingUser || createdUser).toObject();

    const accessToken = jwt.sign({ userId: filteredUser._id.toString() }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_LIFETIME,
    });
    const refreshToken = jwt.sign({ userId: filteredUser._id.toString() }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_LIFETIME,
    });

    await RefreshToken.deleteOne({ userId: filteredUser._id });
    await RefreshToken.create({
      token: refreshToken,
      userId: filteredUser._id,
      userEmail: filteredUser.email,
      expiresAt: Date.now() + MAX_SESSION_LIFETIME,
    });

    await cookies.createRefreshToken({ res, refreshToken, maxAge: MAX_SESSION_LIFETIME });

    res.redirect(`${process.env.CLIENT_URL}/auth/action/success?mode=verifyGoogle&oobCode=${accessToken}`);
  } catch (err) {
    next(err);
  }
};

export {
  register,
  login,
  refresh,
  logout,
  getProfile,
  updatePassword,
  addPassword,
  confirmAddPassword,
  updateEmail,
  confirmUpdateEmail,
  verifyEmail,
  confirmVerifyEmail,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
};
