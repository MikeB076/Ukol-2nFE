import Joi from 'joi';
import { errorMap } from './errorMap.js';

export const validate = (schema) => (req, _res, next) => {
  const src = req.method === 'GET' ? req.query : req.body;
  const { error, value } = schema.validate(src, { abortEarly:false, stripUnknown:true });
  if (error) return next(errorMap('api/DtoInInvalid', 'Invalid dtoIn', { details: error.details }));
  req.dtoIn = value;
  next();
};