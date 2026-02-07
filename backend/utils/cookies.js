import RefreshToken from "../models/refreshToken.model.js";

export const createRefreshToken = async ({  res, refreshToken, maxAge }) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: "none", // if frontend is on different domain
    maxAge,
  });
};

export const clearRefreshToken = async ({  res }) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: "none", // if frontend is on different domain
  });
};
