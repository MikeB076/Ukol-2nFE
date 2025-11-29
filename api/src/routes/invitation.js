// api/src/routes/invitation.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';

import { requireAuth } from '../mw/auth.js';
import { requireRole } from '../mw/roles.js';
import { validate } from '../mw/validate.js';
import { createDtoIn, cancelDtoIn, acceptDtoIn } from '../validators/invitation.js';
import { ok } from '../util.js';

const r = Router();

/**
 * POST /api/invitation/create
 * jen OWNER, vytvoří pozvánku (zatím jen “echo” – nic se neukládá)
 */
r.post(
  '/create',
  requireAuth,
  requireRole(['OWNER']),
  validate(createDtoIn),
  (req, res) => {
    const { listId, email, userId } = req.dtoIn;

    const id = uuid();
    const token = uuid();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 dní

    res.json(
      ok({
        invitation: {
          id,
          listId,
          status: 'PENDING',
          invitedBy: req.user.uuIdentity,
          email: email ?? null,
          userId: userId ?? null,
          token,
          expiresAt: expiresAt.toISOString(),
        },
      })
    );
  }
);

/**
 * DELETE /api/invitation/cancel
 * jen OWNER – zruší pozvánku (echo)
 */
r.delete(
  '/cancel',
  requireAuth,
  requireRole(['OWNER']),
  validate(cancelDtoIn),
  (req, res) => {
    res.json(
      ok({
        cancelled: true,
        dtoIn: req.dtoIn,
      })
    );
  }
);

/**
 * POST /api/invitation/accept
 * může být bez requireAuth – jen validace tokenu (podle varianty ze zadání)
 */
r.post('/accept', validate(acceptDtoIn), (req, res) => {
  // jen demo odpověď podle dokumentu
  res.json(
    ok({
      accepted: true,
      membership: {
        listId: req.dtoIn.id,
        uuIdentity: 'me',
        role: 'MEMBER',
      },
    })
  );
});

export default r;