import express from "express";
import { getPosts, getPost, createPost, updatePost, deletePost } from "../../controllers/post.controller.js";
import logger from "../../middlewares/system/logger.middleware.js";
import { createPostSchema, updatePostSchema } from "../../utils/validators/posts.validator.js";
import validate from "../../middlewares/validate.middleware.js";
import isAuthenticated from "../../middlewares/auth/isAuthenticated.middleware.js";
import allowRoles from "../../middlewares/auth/allowRoles.middleware.js";
import isOwnerOrRoles from "../../middlewares/auth/isOwnerOrRoles.middleware.js";
import checkRoleHierarchy from "../../middlewares/auth/checkRoleHierarchy.middleware.js";
import anyOf from "../../middlewares/auth/anyOf.middleware.js";
import isResourceOwner from "../../middlewares/auth/isResourceOwner.middleware.js";
import loadResource from "../../middlewares/loadResource.middleware.js";
import Post from "../../models/post.model.js";
import User from "../../models/user.model.js";
import loadUser from "../../middlewares/auth/loadUser.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.use(logger);
router.use(isAuthenticated);

router.get("/", getPosts);

router.get("/:id", loadResource(Post, "post"), getPost); // allowed for all authenticated users
// router.get("/:id", loadUser(), loadResource(Post, "post"), isResourceOwner("post"), getPost); // allowed only if owner
// router.get("/:id", loadUser(), loadResource(Post, "post"), allowRoles("admin"), getPost); // allowed only if admin
// router.get(
//   "/:id",
//   loadUser(),
//   loadResource(Post, "post"),
//   isOwnerOrRoles({ reqKey: "post", allowedRoles: ["admin"] }),
//   getPost,
// ); // allowed only if owner or admin
// router.get(
//   "/:id",
//   loadUser(),
//   loadResource(Post, "post"),
//   anyOf(isResourceOwner("post"), allowRoles("admin")),
//   getPost,
// ); // allowed only if owner or admin
// router.get(
//   "/:id",
//   loadUser(),
//   loadResource(Post, "post"),
//   async (req, res, next) => {
//     req.foundUser = await User.findById(req.post.userId);
//     if (!req.foundUser) return next(createError("Target user not found", 404));
//     next();
//   },
//   checkRoleHierarchy({ allowOwner: true }),
//   getPost,
// ); // allowed only if owner or (target user < acting user)

router.post("/", validate(createPostSchema), loadUser(), createPost);
router.patch(
  "/:id",
  validate(updatePostSchema),
  loadUser(),
  loadResource(Post, "post"),
  isResourceOwner("post"),
  updatePost,
);
router.delete(
  "/:id",
  loadUser(),
  loadResource(Post, "post"),
  anyOf(isResourceOwner("post"), allowRoles("superAdmin")),
  deletePost,
);

router.post("/upload-image", validate(createPostSchema), upload.single("image"), (req, res, next) => {
  if (!req.file) {
    const err = new Error("No file uploaded");
    err.status = 400;
    throw err;
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/public-route/uploads/${req.file.filename}`;

  try {
    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: { ...req.filteredBody, imageUrl },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
