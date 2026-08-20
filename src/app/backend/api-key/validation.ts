import Joi from "joi"

export const schema = Joi.object().keys({
  name: Joi.string().min(1).required()
})
