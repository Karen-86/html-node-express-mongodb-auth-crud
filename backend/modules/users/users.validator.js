import Joi from "joi";

export const updateUserSchema = Joi.object({
  name: Joi.string().min(3),
  age: Joi.number().allow(""),
  avatar: Joi.string()
})
  .min(1)
  .options({ abortEarly: false });

export const updateUserByAdminSchema = Joi.object({
  roles: Joi.array().items(Joi.string().valid("user", "admin", "superAdmin"))
})
  .min(1)
  .options({ abortEarly: false });
