import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../mw/auth.js';
import { requireRole } from '../mw/roles.js';
import { validate } from '../mw/validate.js';
import { createDtoIn, cancelDtoIn, acceptDtoIn } from '../validators/invitation.js';

const r = Router();

// OWNER → create invitation
r.post(
  '/create',
  requireAuth,
  requireRole(['OWNER']),
  validate(createDtoIn),
  (req, res) => {
    const invitation = { token: uuid(), status: 'PENDING', ...req.dtoIn };
    res.json({ invitation, uuAppErrorMap: {} });
  }
);

// OWNER → cancel invitation
r.delete(
  '/cancel',
  requireAuth,
  requireRole(['OWNER']),
  validate(cancelDtoIn),
  (req, res) => {
    res.json({ cancelled: true, uuAppErrorMap: {} });
  }
);

// public (no auth) → accept by token
r.post('/accept', validate(acceptDtoIn), (req, res) => {
  res.json({ accepted: true, uuAppErrorMap: {} });
});

export default r;