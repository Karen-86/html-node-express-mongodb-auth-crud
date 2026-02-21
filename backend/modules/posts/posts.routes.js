import express from "express";
import { getPosts, getPost, createPost, updatePost, deletePost } from "./post.controller.js";
import logger from "../../middlewares/system/logger.middleware.js";
import { createPostSchema, updatePostSchema } from "./posts.validator.js";
import validate from "../../middlewares/validate.middleware.js";
import isAuthenticated from "../../middlewares/auth/isAuthenticated.middleware.js";
import allowRoles from "../../middlewares/auth/allowRoles.middleware.js";
import isOwnerOrRoles from "../../middlewares/auth/isOwnerOrRoles.middleware.js";
import checkRoleHierarchy from "../../middlewares/auth/checkRoleHierarchy.middleware.js";
import anyOf from "../../middlewares/auth/anyOf.middleware.js";
import isResourceOwner from "../../middlewares/auth/isResourceOwner.middleware.js";
import loadResource from "../../middlewares/loadResource.middleware.js";
import Post from "./post.model.js";
import User from "../users/user.model.js";
import loadUser from "../../middlewares/auth/loadUser.middleware.js";
import upload from "../../middlewares/upload.middleware.js";
import createError from "../../utils/createError.js";

const router = express.Router();

router.use(logger);
router.use(isAuthenticated);

router.get("/", getPosts);

router.get("/:id", loadResource({ Model: Post, reqKey: "post" }), getPost); // allowed for all authenticated users
// router.get("/:id", loadUser(), loadResource({Model: Post, reqKey: "post"}), isResourceOwner("post"), getPost); // allowed only if owner
// router.get("/:id", loadUser(), loadResource({Model: Post, reqKey: "post"}), allowRoles("admin"), getPost); // allowed only if admin
// router.get(
//   "/:id",
//   loadUser(),
//   loadResource({Model: Post, reqKey: "post"}),
//   isOwnerOrRoles({ reqKey: "post", allowedRoles: ["admin"] }),
//   getPost,
// ); // allowed only if owner or admin
// router.get(
//   "/:id",
//   loadUser(),
//   loadResource({Model: Post, reqKey: "post"}),
//   anyOf(isResourceOwner("post"), allowRoles("admin")),
//   getPost,
// ); // allowed only if owner or admin
// router.get(
//   "/:id",
//   loadUser(),
//   loadResource({Model: Post, reqKey: "post"}),
//   async (req, res, next) => {
//     req.foundUser = await User.findById(req.post.userId);
//     if (!req.foundUser) return next(createError("Target user not found", 404));
//     next();
//   },
//   checkRoleHierarchy({ allowOwner: true }),
//   getPost,
// ); // allowed only if owner or (target user < acting user)

router.post(
  "/",
  upload.single("image"),
  (req, res, next) => {
    delete req.body.image;
    if (req.file) req.body.cover = `${req.protocol}://${req.get("host")}/public-route/uploads/${req.file.filename}`;
    next();
  },
  validate(createPostSchema),
  loadUser(),
  createPost,
);
router.patch(
  "/:id",
  upload.single("image"),
  (req, res, next) => {
    delete req.body.image;
    if (req.file) req.body.cover = `${req.protocol}://${req.get("host")}/public-route/uploads/${req.file.filename}`;
    next();
  },
  validate(updatePostSchema),
  loadUser(),
  loadResource({ Model: Post, reqKey: "post" }),
  isResourceOwner("post"),
  updatePost,
);
router.delete(
  "/:id",
  loadUser(),
  loadResource({ Model: Post, reqKey: "post" }),
  anyOf(isResourceOwner("post"), allowRoles("superAdmin")),
  deletePost,
);

// router.post("/upload-image", validate(createPostSchema), upload.single("image"), (req, res, next) => {
//   if (!req.file) throw createError('No file uploaded', 400)

//   const imageUrl = `${req.protocol}://${req.get("host")}/public-route/uploads/${req.file.filename}`;

//   try {
//     res.json({
//       success: true,
//       message: "Image uploaded successfully",
//       data: { ...req.filteredBody, imageUrl },
//     });
//   } catch (err) {
//     next(err);
//   }
// });

export default router;
