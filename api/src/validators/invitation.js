import Joi from 'joi';

export const createDtoIn = Joi.object({
  listId: Joi.string().required(),
  email: Joi.string().email().optional(),
  userId: Joi.string().optional(),
}).xor('email', 'userId').unknown(false);

// Cancel by invitation id (per assignment doc)
export const cancelDtoIn = Joi.object({
  id: Joi.string().required(),
}).unknown(false);

// Accept by token (public route)
export const acceptDtoIn = Joi.object({
  token: Joi.string().required(),
}).unknown(false);