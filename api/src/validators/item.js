import Joi from 'joi';

// GET item/list
export const listDtoIn = Joi.object({
  listId: Joi.string().required(),
  showDone: Joi.boolean().default(false),
  pageInfo: Joi.object({
    pageIndex: Joi.number().integer().min(0).default(0),
    pageSize: Joi.number().integer().min(1).max(100).default(50),
  }).default({ pageIndex: 0, pageSize: 50 }),
});

// POST item/create
export const createDtoIn = Joi.object({
  listId: Joi.string().required(),
  name: Joi.string().min(1).required(),
});

// PATCH item/update
export const updateDtoIn = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(1).optional(),
  done: Joi.boolean().optional(),
});

export const setCompletedDtoIn = Joi.object({
  id: Joi.string().required(),
  done: Joi.boolean().required(),
});

// DELETE item/delete
export const deleteDtoIn = Joi.object({
  id: Joi.string().required(),
});