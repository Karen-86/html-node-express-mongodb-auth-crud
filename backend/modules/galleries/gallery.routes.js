import express from "express";
import {
  createGallery,
  getGallery,
  getGalleries,
  deleteGallery,
  updateGalleryImage,
  deleteGalleryImage,
  deleteGalleryImages,
} from "./gallery.controller.js";
import Gallery from "./gallery.model.js";
import logger from "../../middlewares/system/logger.middleware.js";
import isAuthenticated from "../../middlewares/auth/isAuthenticated.middleware.js";
import multer from "multer";
import loadUser from "../../middlewares/auth/loadUser.middleware.js";
import isResourceOwner from "../../middlewares/auth/isResourceOwner.middleware.js";
import loadResource from "../../middlewares/loadResource.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = express.Router();

router.use(logger);
router.use(isAuthenticated);

// GALLERIES
router.get("/", loadUser(), getGalleries);
router.get("/:galleryId", loadResource({ paramKey: "galleryId", reqKey: "gallery", Model: Gallery }), getGallery);
router.post("/", upload.single("image"), loadUser(), createGallery);
router.delete(
  "/:galleryId",
  loadUser(),
  loadResource({ paramKey: "galleryId", reqKey: "gallery", Model: Gallery }),
  isResourceOwner("gallery"),
  deleteGallery,
);

// GALLERY->IMAGES
router.patch(
  "/:galleryId",
  upload.single("image"),
  loadUser(),
  loadResource({ paramKey: "galleryId", reqKey: "gallery", Model: Gallery }),
  isResourceOwner("gallery"),
  updateGalleryImage,
);

router.delete(
  "/:galleryId/images/:imageId",
  loadUser(),
  loadResource({ paramKey: "galleryId", reqKey: "gallery", Model: Gallery }),
  isResourceOwner("gallery"),
  deleteGalleryImage,
);
router.delete(
  "/:galleryId/images",
  loadUser(),
  loadResource({ paramKey: "galleryId", reqKey: "gallery", Model: Gallery }),
  isResourceOwner("gallery"),
  deleteGalleryImages,
);

export default router;
