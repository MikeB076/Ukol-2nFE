import Joi from 'joi';
import { errorMap } from './errorMap.js';

// Unified dtoIn validator middleware
// - GET → req.query, others → req.body
// - abortEarly:false → collect all issues
// - stripUnknown:false → keep strictness (validators may set .unknown(false))
// - On error, forward a standardized InvalidDtoIn to the error handler
export const validate = (schema) => (req, _res, next) => {
  const src = req.method === 'GET' ? req.query : req.body;
  const { error, value } = schema.validate(src, {
    abortEarly: false,
    stripUnknown: false,
    convert: true,
  });

  if (error) {
    return next(
      errorMap('api/InvalidDtoIn', 'Invalid dtoIn', { details: error.details })
    );
  }

  req.dtoIn = value;
  next();
};