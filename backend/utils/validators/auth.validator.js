import Joi from "joi";

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).required(),
  age: Joi.number(),
  email: Joi.string()
    .min(3)
    .email({ tlds: { allow: false } })
    .lowercase()
    .required(),
  password: Joi.string().min(6).required(),
  // repeatPassword: Joi.string().valid(Joi.ref('password')).required().messages({
  //     'any.only': 'Passwords must match'
  // })
  repeatPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "string.empty": "Repeat password cannot be empty",
    "any.only": "Passwords must match",
  }),
  // message:  Joi.string().min(15).allow('').optional(),
}).options({ abortEarly: false });

export const loginUserSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
}).options({ abortEarly: false });

export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).label("current password").required(),
  newPassword: Joi.string().min(6).label("new password").invalid(Joi.ref("currentPassword")).required().messages({
    "any.invalid": "New password must be different from current password",
  }),
});
export const addPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).label("new password").required()
});

export const updateEmailSchema = Joi.object({
  newEmail: Joi.string().email().lowercase().label("email").required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).label("new password").required(),
});
