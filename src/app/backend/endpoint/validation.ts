import Joi from "joi"

export const schema = Joi.object().keys({
  title: Joi.string().min(1).required(),
  path: Joi.string().min(1).required(),
  method: Joi.string().valid("POST", "GET", "PATCH", "PUT", "DELETE", "OPTION").required(),
  response_template_id: Joi.number().allow(null).required(),
  max_pending_time: Joi.number().required().allow(null),
  is_multiple_templates: Joi.boolean().required(),
  relay_payload_template_id: Joi.number().allow(null).required(),
  relay_enabled: Joi.boolean().required(),
  relay_target: Joi.string().allow(null).required(),
  relay_method: Joi.string().valid("POST", "GET", "PATCH", "PUT", "DELETE", "OPTION").required()
})
