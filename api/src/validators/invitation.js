import Joi from 'joi';
export const createDtoIn = Joi.object({
  listId: Joi.string().required(),
  email: Joi.string().email().optional(),
  userId: Joi.string().optional()
}).xor('email','userId');

export const cancelDtoIn = Joi.object({ listId: Joi.string().required(), invitee: Joi.string().required() });
export const acceptDtoIn = Joi.object({ token: Joi.string().required() });