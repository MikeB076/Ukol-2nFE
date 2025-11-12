// src/auth.js
export function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) {
    return res.status(401).json({ uuAppErrorMap: { "api/Unauthorized": { message: "Missing or invalid token" } } });
  }
  // Pro demo – dovol si „přepínat“ uživatele query parametrem ?as=2222-3333
  const as = req.query.as || req.headers["x-as-user"] || "0000-1111";
  req.user = { uuIdentity: as };
  next();
}

export function hasRole(db, listId, uuIdentity, allowedRoles = ["OWNER","MEMBER"]) {
  const m = db.memberships.find(m => m.listId === listId && m.uuIdentity === uuIdentity);
  return m && allowedRoles.includes(m.role);
}