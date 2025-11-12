import Joi from 'joi';

export const createDtoIn = Joi.object({
  name: Joi.string().min(1).required(),
});

export const getDtoIn = Joi.object({
  id: Joi.string().required(),
});

// PATCH shoppingList/update – name is optional, archived can be toggled
export const updateDtoIn = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(1).optional(),
  archived: Joi.boolean().optional(),
});

export const deleteDtoIn = Joi.object({
  id: Joi.string().required(),
});

// GET shoppingList/listByMyAccess – use `archived` (not showArchived) + pagination
export const listMineDtoIn = Joi.object({
  archived: Joi.boolean().default(false),
  query: Joi.string().allow('').default(''),
  pageInfo: Joi.object({
    pageIndex: Joi.number().integer().min(0).default(0),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
  }).default({ pageIndex: 0, pageSize: 20 }),
});