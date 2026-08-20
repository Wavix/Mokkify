import Joi from "joi"

const methodSchema = Joi.string().valid("POST", "GET", "PATCH", "PUT", "DELETE", "OPTIONS", "HEAD")
const PATH_PATTERN = /^\/?[A-Za-z0-9\-_.:*]+(?:\/[A-Za-z0-9\-_.:*]+)*$/

export const schema = Joi.object().keys({
  title: Joi.string().min(1).required(),
  path: Joi.string().min(1).pattern(PATH_PATTERN).required(),
  method: methodSchema.required(),
  response: Joi.object()
    .keys({
      code: Joi.number().required(),
      content_type: Joi.string()
        .pattern(/^[\w.+-]+\/[\w.+-]+$/)
        .optional(),
      headers: Joi.object().pattern(Joi.string(), Joi.string()).optional().allow(null),
      body: Joi.string().required().allow(null)
    })
    .required(),
  relay: Joi.object()
    .keys({
      target: Joi.string().min(1).required(),
      method: methodSchema.required(),
      body: Joi.string().optional()
    })
    .optional(),
  max_pending_time: Joi.number().optional().allow(null)
})
