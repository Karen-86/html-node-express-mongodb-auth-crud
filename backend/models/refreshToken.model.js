import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      lowercase: true,
      required: true,
    },
    expiresAt: {
      type: Date,
      expires: 0,
      required: true,
    },
  },
  { timestamps: true },
);

const refreshTokenModel = mongoose.model("RefreshToken", refreshTokenSchema);

export default refreshTokenModel;
