import { Router } from 'express';
import { requireAuth } from '../mw/auth.js';
import { validate } from '../mw/validate.js';
import { requireRole } from '../mw/roles.js';
import { memberListDtoIn, memberRemoveDtoIn, memberLeaveDtoIn } from '../validators/member.js';

const r = Router();

r.get('/list', requireAuth, requireRole(['OWNER', 'MEMBER']), validate(memberListDtoIn), (req,res)=>{
  const { listId } = req.dtoIn;
  // echo výstup dle zadání
  res.json({
    memberList: [
      { uuIdentity: '0000-1111', role: 'OWNER' },
      { uuIdentity: '2222-3333', role: 'MEMBER' }
    ],
    uuAppErrorMap: {}
  });
});

r.delete('/remove', requireAuth, requireRole(['OWNER']), validate(memberRemoveDtoIn), (req,res)=>{
  res.json({ removed: true, dtoIn: req.dtoIn, uuAppErrorMap:{} });
});

r.post('/leave', requireAuth, requireRole(['MEMBER']), validate(memberLeaveDtoIn), (req,res)=>{
  res.json({ left: true, dtoIn: req.dtoIn, uuAppErrorMap:{} });
});

export default r;