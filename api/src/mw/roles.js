// api/src/mw/roles.js

import { errorMap } from './errorMap.js';

// jednoduchá hard-coded mapa rolí podle uuIdentity
const roleByUser = {
  '0000-1111': ['OWNER'],          // náš „demo“ OWNER
  '2222-3333': ['MEMBER'],         // příklad člena
};

export function requireRole(requiredRoles = []) {
  return (req, res, next) => {
    const user = req.user || {};
    const roles = roleByUser[user.uuIdentity] || [];

    // pokud žádná z requiredRoles není v roles → 403
    const ok = requiredRoles.some((r) => roles.includes(r));
    if (!ok) {
      return next(
        errorMap('api/Forbidden', 'Required role: ' + requiredRoles.join(' OR '), {
          required: requiredRoles,
          provided: roles.length ? roles : null,
        }, 403)
      );
    }

    // role prošly
    req.roles = roles;
    next();
  };
}