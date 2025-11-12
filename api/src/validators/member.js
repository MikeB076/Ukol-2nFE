import Joi from 'joi';
export const memberListDtoIn = Joi.object({ listId: Joi.string().required() });
export const memberRemoveDtoIn = Joi.object({ listId: Joi.string().required(), uuIdentity: Joi.string().required() });
export const memberLeaveDtoIn  = Joi.object({ listId: Joi.string().required() });