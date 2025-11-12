// pro účely úkolu: stačí, když pošleš hlavičku Authorization: Bearer <anything>
export const requireAuth = (req, _res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return next(require('../mw/errorMap.js').errorMap('api/Unauthorized','Missing token',{},401));
  // “přihlášený” uživatel
  req.user = { uuIdentity: '0000-1111', name: 'Demo User' };
  next();
};