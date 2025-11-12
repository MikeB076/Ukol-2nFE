import Joi from 'joi';
export const listDtoIn   = Joi.object({ listId: Joi.string().required(), showDone: Joi.boolean().default(false) });
export const createDtoIn = Joi.object({ listId: Joi.string().required(), name: Joi.string().min(1).required() });
export const updateDtoIn = Joi.object({ id: Joi.string().required(), name: Joi.string().min(1).required() });
export const setCompletedDtoIn = Joi.object({ id: Joi.string().required(), done: Joi.boolean().required() });
export const deleteDtoIn = Joi.object({ id: Joi.string().required() });