import Joi from "joi";

export const createPostSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(3).allow(""),
  date: Joi.date().allow(null, ""),
  cover: Joi.string().allow(null,""),
}).options({ abortEarly: false });

export const updatePostSchema = Joi.object({
  name: Joi.string().min(3),
  description: Joi.string().min(3).allow(""),
  date: Joi.date().allow(null, ""),
  cover: Joi.string().allow(null, ""),
}).min(1).options({ abortEarly: false });
