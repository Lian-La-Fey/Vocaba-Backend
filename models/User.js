import mongoose from "mongoose";
import Joi from "joi";
// const { joiPasswordExtendCore } = require('joi-password');
import { joiPasswordExtendCore } from "joi-password";
const joiPassword = Joi.extend(joiPasswordExtendCore);

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  lists: {
    type: [String],
    default: [],
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

export const passwordComplexity = joiPassword
  .string()
  .min(8)
  .max(24)
  .minOfSpecialCharacters(1)
  .minOfLowercase(1)
  .minOfUppercase(1)
  .minOfNumeric(1)
  .noWhiteSpaces()
  .required()
  .messages({
    "string.min": "Password should contain at least 8 character",
    "string.max": "Password should contain at most 24 character",
    "password.minOfUppercase":
      "Password should contain at least {#min} uppercase character",
    "password.minOfSpecialCharacters":
      "Password  should contain at least {#min} special character",
    "password.minOfLowercase":
      "Password  should contain at least {#min} lowercase character",
    "password.minOfNumeric":
      "Password  should contain at least {#min} numeric character",
    "password.noWhiteSpaces": "{#label} should not contain white spaces",
  });

export const validate = (user) => {
  const schema = Joi.object({
    userName: Joi.string()
      .min(3)
      .max(12)
      .required()
      .pattern(new RegExp(/^[^\s]([a-zA-Z0-9_-]+\s?)+[a-zA-Z0-9_-]+$/))
      .messages({
        "string.pattern.base":
          "Invalid username. Only letters, numbers, middle white space, hypehn and underscore allowed.",
        "string.min": "Invalid username. Minimum 3 character required.",
        "string.max": "Invalid username. Maximum 12 characters allowed.",
      }),
    email: Joi.string().email().required(),
    password: passwordComplexity,
  });

  return schema.validate(user);
};

export const validateSingleList = (list) => {
  const schema = Joi.object({
    list: Joi.string()
      .min(3)
      .max(24)
      .pattern(new RegExp(/^[^\s]([a-zA-Z0-9-']+\s?)+[a-zA-Z0-9-']+$/))
      .messages({
        "string.pattern.base":
        "Invalid list name. Only letters, numbers, middle white space, hypehn and backtick allowed.",
        "string.min": "Invalid list name. Minimum 3 character required.",
        "string.max": "Invalid list name. Maximum 24 characters allowed.",
      })
      .required(),
  });

  return schema.validate(list);
};

export const User = mongoose.model("User", userSchema);
