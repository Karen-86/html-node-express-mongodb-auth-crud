import mongoose from "mongoose";

const resetPasswordTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    userEmail: {
      type: String,
      lowercase: true,
      required: true
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

const ResetPasswordToken = mongoose.model("ResetPasswordToken", resetPasswordTokenSchema);

export default ResetPasswordToken;
