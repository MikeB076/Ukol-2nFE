// api/src/mw/roles.js
import { errorMap } from './errorMap.js';

// Usage: requireRole(['OWNER','MEMBER'])
// Reads role from header `x-role` and compares case-insensitively
export const requireRole = (allowed = []) => (req, _res, next) => {
  if (!Array.isArray(allowed) || allowed.length === 0) return next();

  const raw = req.header('x-role');
  const role = raw ? String(raw).trim().toUpperCase() : '';
  const allow = allowed.map(r => String(r).trim().toUpperCase());

  if (!role || !allow.includes(role)) {
    return next(
      errorMap(
        'api/Forbidden',
        `Required role: ${allowed.join(', ')}`,
        { required: allow, provided: role || null },
        403
      )
    );
  }
  next();
};