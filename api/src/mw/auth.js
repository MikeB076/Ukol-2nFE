// api/src/mw/auth.js
import { errorMap } from './errorMap.js';

// Require Authorization: Bearer <token>
// Optionally allow switching the demo identity via header `x-as-user` or query `?as=`
export const requireAuth = (req, _res, next) => {
  const h = req.headers.authorization || req.headers.Authorization || '';
  if (!h.startsWith('Bearer ')) {
    return next(errorMap('api/Unauthorized', 'Missing token', {}, 401));
  }
  const as = req.headers['x-as-user'] || req.query.as || '0000-1111';
  req.user = { uuIdentity: String(as), name: 'Demo User' };
  return next();
};