import Joi from "joi";

export const createPostSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(3).required(),
  date: Joi.date()
}).options({ abortEarly: false })

export const updatePostSchema = Joi.object({
  name: Joi.string().min(3),
  description: Joi.string().min(3),
}).min(1).options({ abortEarly: false })
