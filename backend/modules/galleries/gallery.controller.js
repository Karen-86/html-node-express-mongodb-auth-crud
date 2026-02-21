import Gallery from "./gallery.model.js";
import createError from "../../utils/createError.js";
import * as imageUtils from "../../utils/imageUtils.js";
import * as cloudinaryService from "../../services/cloudinary.service.js";
import mongoose from "mongoose";

// @GET: /gallery | middlewares: isAuthenticated, loadUser
const getGalleries = async (req, res, next) => {
  try {
    const filters = { ...req.query };

    const galleries = await Gallery.find(filters);

    res.status(200).json({
      success: true,
      message: "all galleries",
      data: galleries,
    });
  } catch (err) {
    console.error(`=getGalleries= Error: ${err}`);
    next(err);
  }
};

// @GET: /gallery/:id | middlewares: isAuthenticated, loadUser, loadResource
const getGallery = async (req, res, next) => {
  try {
    const gallery = req.gallery;

    res.status(200).json({
      success: true,
      message: "gallery found successfully",
      data: gallery,
    });
  } catch (err) {
    console.error(`=getGalleries= Error: ${err}`);
    next(err);
  }
};

// @POST: /gallery | middlewares: isAuthenticated, upload.single(), loadUser
const createGallery = async (req, res, next) => {
  let uploadedPublicId;
  const user = req.user;
  const file = req.file;
  const index = req.body.index;

  try {
    if (!file) throw createError("No file uploaded", 400);

    const duplicate = await Gallery.findOne({ userId: user._id.toString() });
    if (duplicate) throw createError("Gallery already exist", 400);

    let buffer = file.buffer;
    if (buffer.length > 1024 * 1024) buffer = await imageUtils.resizeImage({ buffer: file.buffer });

    const createdResult = await cloudinaryService.createImage({
      buffer,
      folderPath: `users/${user._id}/gallery`,
      publicId: `${user._id}_${Date.now()}`,
    });

    uploadedPublicId = createdResult.public_id;

    const image = {
      name: createdResult.original_filename,
      index: index,
      publicId: createdResult.public_id,
      url: createdResult.secure_url,
    };

    // const gallery = await Gallery.findOneAndUpdate(
    //   {
    //     userId: req.user._id.toString(),
    //     // images: { $not: { $elemMatch: { index: req.body.index } } } // prevent duplicate order
    //   },
    //   {
    //     $setOnInsert: {
    //       ...req.filteredBody,
    //       userId: req.user._id.toString(),
    //       author: req.user.email,
    //     },
    //     $push: { images: image }, // only if gallery exists or created
    //   },
    //   { new: true, upsert: true },
    // );

    const gallery = await Gallery.create({
      userId: user._id.toString(),
      author: user.email,
      images: [image],
    });

    res.status(201).json({
      success: true,
      message: "image uploaded successfully",
      data: gallery,
    });
  } catch (err) {
    if (err.code === 11000 && uploadedPublicId) {
      await cloudinaryService.deleteImage({ publicId: uploadedPublicId });
    }

    console.error(`=uploadGallery= Error: ${err}`);
    next(err);
  }
};

// @DELETE: /gallery/:id | middlewares: isAuthenticated, loadUser, loadResource, isResourceOwner
const deleteGallery = async (req, res, next) => {
  try {
    const gallery = req.gallery;

    const publicIds = gallery.images.map((img) => img.publicId);

    if (publicIds.length) await cloudinaryService.deleteImages({ publicIds });

    await gallery.deleteOne();

    res.status(200).json({
      success: true,
      message: "gallery deleted",
      data: gallery,
    });
  } catch (err) {
    console.error(`=deleteGallery= Error: ${err}`);
    next(err);
  }
};

// @PATCH: /galleries/:id | middlewares: isAuthenticated, upload.single, loadUser, loadResource, isResourceOwner
const updateGalleryImage = async (req, res, next) => {
  try {
    const user = req.user;
    const gallery = req.gallery;
    const imageId = req.body.imageId;
    const index = req.body.index;

    const oldImagePublicId = imageId ? gallery.images.find((img) => img._id.toString() === imageId)?.publicId : null;

    let updatedGallery;

    if (!req.file) throw createError("No file uploaded", 400);

    let buffer = req.file.buffer;
    if (buffer.length > 1024 * 1024) {
      buffer = await imageUtils.resizeImage({ buffer });
    }

    const createdResult = await cloudinaryService.createImage({
      buffer,
      folderPath: `users/${user._id}/gallery`,
      publicId: `${user._id}_${Date.now()}`,
    });

    const newImage = {
      index,
      name: createdResult.original_filename,
      publicId: createdResult.public_id,
      url: createdResult.secure_url,
    };

    if (imageId) {
      updatedGallery = await Gallery.findOneAndUpdate(
        { _id: gallery._id, "images._id": imageId },
        { $set: { "images.$": newImage } },
        { new: true },
      );

      if (updatedGallery && oldImagePublicId) {
        cloudinaryService.deleteImage({ publicId: oldImagePublicId }).catch(console.error);
      }
    } else {
      updatedGallery = await Gallery.findOneAndUpdate(
        { _id: gallery._id },
        { $push: { images: newImage } },
        { new: true, upsert: true },
      );
    }

    res.status(200).json({
      success: true,
      message: "Gallery updated",
      data: updatedGallery,
    });
  } catch (err) {
    console.error("=updateGallery= Error:", err);
    next(err);
  }
};

// @DELETE: /galleries/:galleryId/images/:imageId | middlewares: isAuthenticated, loadUser, loadResource, isResourceOwner
const deleteGalleryImage = async (req, res, next) => {
  try {
    const gallery = req.gallery;

    const imageId = req.params.imageId;
    if (!mongoose.Types.ObjectId.isValid(imageId)) return next(createError("Invalid image ID", 400));

    const image = gallery.images.find((image) => image._id.toString() === imageId);
    if (!image) throw createError("Image not found", 404);

    const updatedGallery = await Gallery.findOneAndUpdate(
      { _id: gallery._id },
      { $pull: { images: { _id: imageId } } },
      { new: true },
    );

    if (updatedGallery) await cloudinaryService.deleteImage({ publicId: image.publicId });

    res.status(200).json({
      success: true,
      message: "gallery image deleted",
      data: updatedGallery,
    });
  } catch (err) {
    console.error(`=deleteGalleryImage= Error: ${err}`);
    next(err);
  }
};

// @DELETE: /galleries/:galleryId/images | middlewares: isAuthenticated, loadUser, loadResource, isResourceOwner
const deleteGalleryImages = async (req, res, next) => {
  try {
    const gallery = req.gallery;
    const { all } = req.query;
    const images = req.body?.images || [];

    let imagesToDelete = [];

    if (all === "true") {
      // delete all images
      imagesToDelete = gallery.images;
    } else {
      if (!Array.isArray(images) || images.length === 0) {
        throw createError("No images provided", 400);
      }

      imagesToDelete = gallery.images.filter((img) => images.some((i) => i._id.toString() === img._id.toString()));
    }

    if (!imagesToDelete.length) throw createError("No images found to delete", 404);

    const imageIds = imagesToDelete.map((img) => img._id);
    const publicIds = imagesToDelete.map((img) => img.publicId);

    const updatedGallery = await Gallery.findByIdAndUpdate(
      gallery._id,
      {
        $pull: { images: { _id: { $in: imageIds } } },
      },
      { new: true },
    );

    if (publicIds.length) {
      await cloudinaryService.deleteImages({ publicIds });
    }

    res.status(200).json({
      success: true,
      message: all === "true" ? "All gallery images deleted" : "Selected gallery images deleted",
      data: updatedGallery,
    });
  } catch (err) {
    next(err);
  }
};

export {
  getGalleries,
  getGallery,
  createGallery,
  deleteGallery,
  updateGalleryImage,
  deleteGalleryImage,
  deleteGalleryImages,
};
