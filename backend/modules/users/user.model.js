import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
      required: function () {
        // password required ONLY for local auth
        return !this.providerData?.length;
      },
    },
    roles: {
      type: [String],
      required: true,
      default: ["user"],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
    providerData: [
      {
        displayName: String,
        email: String,
        photoURL: String,
        providerId: String,
        uid: String
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
