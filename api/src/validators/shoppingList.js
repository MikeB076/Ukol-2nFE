import Joi from 'joi';

export const createDtoIn = Joi.object({
  name: Joi.string().min(1).required(),
});

export const getDtoIn = Joi.object({
  id: Joi.string().required(),
});

export const updateDtoIn = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(1).required(),
});

export const deleteDtoIn = Joi.object({
  id: Joi.string().required(),
});

export const listMineDtoIn = Joi.object({
  showArchived: Joi.boolean().default(false),
  query: Joi.string().allow('').default(''),
});