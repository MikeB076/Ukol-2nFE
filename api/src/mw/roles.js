// api/src/mw/roles.js
export const requireRole = (allowed = []) => (req, res, next) => {
  const role = String(req.header('x-role') || '').toUpperCase(); // např. OWNER | MEMBER
  if (!role || !allowed.map(r => r.toUpperCase()).includes(role)) {
    return res.status(403).json({
      uuAppErrorMap: {
        'api/Forbidden': { message: `Required role: ${allowed.join(', ')}` }
      }
    });
  }
  next();
};