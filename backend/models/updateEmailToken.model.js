import mongoose from "mongoose";

const updateEmailTokenSchema = new mongoose.Schema(
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
      required: true
    },
    newEmail: {
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

const UpdateEmailToken = mongoose.model("UpdateEmailToken", updateEmailTokenSchema);

export default UpdateEmailToken;
