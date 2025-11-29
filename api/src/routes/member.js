// api/src/routes/member.js
import { Router } from 'express';
import { requireAuth } from '../mw/auth.js';
import { validate } from '../mw/validate.js';
import { requireRole } from '../mw/roles.js';
import {
  memberListDtoIn,
  memberRemoveDtoIn,
  memberLeaveDtoIn,
} from '../validators/member.js';
import { ok } from '../util.js';

const r = Router();

// GET /api/member/list?listId=...
r.get(
  '/list',
  requireAuth,
  requireRole(['OWNER', 'MEMBER']),
  validate(memberListDtoIn),
  (req, res) => {
    const { listId } = req.dtoIn;

    // demo data podle dokumentu
    res.json(
      ok({
        memberList: [
          { uuIdentity: '0000-1111', role: 'OWNER' },
          { uuIdentity: '2222-3333', role: 'MEMBER' },
        ],
      })
    );
  }
);

// DELETE /api/member/remove
r.delete(
  '/remove',
  requireAuth,
  requireRole(['OWNER']),
  validate(memberRemoveDtoIn),
  (req, res) => {
    res.json(
      ok({
        removed: true,
        dtoIn: req.dtoIn,
      })
    );
  }
);

// POST /api/member/leave
r.post(
  '/leave',
  requireAuth,
  requireRole(['MEMBER']),
  validate(memberLeaveDtoIn),
  (req, res) => {
    res.json(
      ok({
        left: true,
        dtoIn: req.dtoIn,
      })
    );
  }
);

export default r;