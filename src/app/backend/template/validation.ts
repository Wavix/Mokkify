import Joi from "joi"

export const schema = Joi.object().keys({
  title: Joi.string().min(1).required(),
  body: Joi.string().required().allow(null),
  code: Joi.number().required().default(200)
})
