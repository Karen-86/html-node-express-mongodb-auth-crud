import mongoose from "mongoose";

const verifyEmailTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    author: {
      type: String,
      lowercase: true,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      expires: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const VerifyEmailToken = mongoose.model("VerifyEmailToken", verifyEmailTokenSchema);

export default VerifyEmailToken;
