import express from "express";
import { getUsers, getUser, updateUser, deleteUser, updateUserByAdmin } from "./user.controller.js";
import User from "./user.model.js";
import validate from "../../middlewares/validate.middleware.js";
import { updateUserSchema, updateUserByAdminSchema } from "./users.validator.js";
import isAuthenticated from "../../middlewares/auth/isAuthenticated.middleware.js";
import isOwner from "../../middlewares/auth/isOwner.middleware.js";
import allowRoles from "../../middlewares/auth/allowRoles.middleware.js";
import isOwnerOrRoles from "../../middlewares/auth/isOwnerOrRoles.middleware.js";
import anyOf from "../../middlewares/auth/anyOf.middleware.js";
import loadResource from "../../middlewares/loadResource.middleware.js";
import loadUser from "../../middlewares/auth/loadUser.middleware.js";
import checkRoleHierarchy from "../../middlewares/auth/checkRoleHierarchy.middleware.js";
import { PERMISSIONS } from "../../constants/index.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", getUsers);

router.get("/:id", loadResource({ Model: User, reqKey: "foundUser" }), getUser); // allowed for all authenticated users
// router.get("/:id", loadUser(), loadResource({Model: User, reqKey: "foundUser"}), isOwner, getUser); // allowed only if owner
// router.get("/:id", loadUser(), loadResource({Model: User, reqKey: "foundUser"}), allowRoles("admin"), getUser); // allowed only if admin
// router.get("/:id", loadUser(), loadResource({Model: User, reqKey: "foundUser"}), isOwnerOrRoles({ allowedRoles: ["admin"] }), getUser); // allowed only if owner or admin
// router.get("/:id", loadUser(), loadResource({Model: User, reqKey: "foundUser"}), anyOf(isOwner, allowRoles("admin")), getUser); // allowed only if owner or admin
// router.get("/:id", loadUser(), loadResource({Model: User, reqKey: "foundUser"}), checkRoleHierarchy({ allowOwner: true }), getUser); // allowed only if owner or (target user < acting user)

router.patch(
  "/:id",
  validate(updateUserSchema),
  loadUser(),
  loadResource({ Model: User, reqKey: "foundUser" }),
  isOwner,
  updateUser,
);
router.delete(
  "/:id",
  loadUser(),
  loadResource({ Model: User, reqKey: "foundUser" }),
  checkRoleHierarchy({ allowOwner: true }),
  deleteUser,
);

router.patch(
  "/update-user-by-admin/:id",
  validate(updateUserByAdminSchema),
  loadUser(),
  loadResource({ Model: User, reqKey: "foundUser" }),
  checkRoleHierarchy(),
  updateUserByAdmin,
);

export default router;
