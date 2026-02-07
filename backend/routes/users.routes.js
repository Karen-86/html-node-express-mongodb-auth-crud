import express from "express";
import { getUsers, getUser, updateUser, deleteUser, updateUserByAdmin } from "../controllers/user.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { updateUserSchema, updateUserByAdminSchema } from "../utils/validators/users.validator.js";
import isAuthenticated from "../middlewares/auth/isAuthenticated.middleware.js";
import isOwner from "../middlewares/auth/isOwner.middleware.js";
import allowRoles from "../middlewares/auth/allowRoles.middleware.js";
import isOwnerOrRoles from "../middlewares/auth/isOwnerOrRoles.middleware.js";
import anyOf from "../middlewares/auth/anyOf.middleware.js";
import loadResource from "../middlewares/loadResource.middleware.js";
import loadUser from "../middlewares/auth/loadUser.middleware.js";
import User from "../models/user.model.js";
import checkRoleHierarchy from "../middlewares/auth/checkRoleHierarchy.middleware.js";
import { PERMISSIONS } from "../constants/index.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", getUsers);

router.get("/:id", loadResource(User, "foundUser"), getUser); // allowed for all authenticated users
// router.get("/:id", loadUser(), loadResource(User, "foundUser"), isOwner, getUser); // allowed only if owner
// router.get("/:id", loadUser(), loadResource(User, "foundUser"), allowRoles("admin"), getUser); // allowed only if admin
// router.get("/:id", loadUser(), loadResource(User, "foundUser"), isOwnerOrRoles({ allowedRoles: ["admin"] }), getUser); // allowed only if owner or admin
// router.get("/:id", loadUser(), loadResource(User, "foundUser"), anyOf(isOwner, allowRoles("admin")), getUser); // allowed only if owner or admin
// router.get("/:id", loadUser(), loadResource(User, "foundUser"), checkRoleHierarchy({ allowOwner: true }), getUser); // allowed only if owner or (target user < acting user)

router.patch("/:id", validate(updateUserSchema), loadUser(), loadResource(User, "foundUser"), isOwner, updateUser);
router.delete(
  "/:id",
  loadUser(),
  loadResource(User, "foundUser"),
  checkRoleHierarchy({ allowOwner: true }),
  deleteUser,
);

router.patch(
  "/update-user-by-admin/:id",
  validate(updateUserByAdminSchema),
  loadUser(),
  loadResource(User, "foundUser"),
  checkRoleHierarchy(),
  updateUserByAdmin,
);

export default router;
