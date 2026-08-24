import Joi from "joi"

const methodSchema = Joi.string().valid("POST", "GET", "PATCH", "PUT", "DELETE", "OPTIONS", "HEAD")

export const schema = Joi.object().keys({
  method: methodSchema.optional(),
  query: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  headers: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  body: Joi.any().optional()
})
