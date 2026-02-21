import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      unique: true,
      ref: "User",
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    images: {
      type: [
        {
          name: { type: String, required: true },
          index: { type: Number, required: true },
          publicId: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;
