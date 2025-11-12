import Joi from 'joi';

export const memberListDtoIn = Joi.object({
  listId: Joi.string().required(),
}).unknown(false);

export const memberRemoveDtoIn = Joi.object({
  listId: Joi.string().required(),
  uuIdentity: Joi.string().required(),
}).unknown(false);

export const memberLeaveDtoIn = Joi.object({
  listId: Joi.string().required(),
}).unknown(false);