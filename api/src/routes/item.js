import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../mw/auth.js';
import { validate } from '../mw/validate.js';
import { listDtoIn, createDtoIn, updateDtoIn, setCompletedDtoIn, deleteDtoIn } from '../validators/item.js';
import { requireRole } from '../mw/roles.js';

const r = Router();

r.get('/list', requireAuth, requireRole(['OWNER','MEMBER']), validate(listDtoIn), (req,res)=>{
  const { showDone, pageInfo } = req.dtoIn;
  const all = [
    { id:'I1', listId:'L1', name:'Milk', done:false },
    { id:'I2', listId:'L1', name:'Bread', done:true },
    { id:'I3', listId:'L1', name:'Eggs', done:false },
  ];
  const filtered = showDone ? all : all.filter(i=>!i.done);
  const { pageIndex = 0, pageSize = 50 } = pageInfo || {};
  const total = filtered.length;
  const start = pageIndex * pageSize;
  const page = filtered.slice(start, start + pageSize);
  res.json({ itemList: page, pageInfo: { pageIndex, pageSize, total }, uuAppErrorMap:{} });
});

r.post('/create', requireAuth, requireRole(['OWNER','MEMBER']), validate(createDtoIn), (req,res)=>{
  const item = { id: uuid(), listId:req.dtoIn.listId, name:req.dtoIn.name, done:false };
  res.status(201).json({ item, uuAppErrorMap:{} });
});

r.patch('/update', requireAuth, requireRole(['OWNER','MEMBER']), validate(updateDtoIn), (req,res)=>{
  const { id, name } = req.dtoIn;
  const item = { id };
  if (typeof name === 'string') item.name = name;
  res.json({ item, uuAppErrorMap:{} });
});

r.patch('/setCompleted', requireAuth, requireRole(['OWNER','MEMBER']), validate(setCompletedDtoIn), (req,res)=>{
  const { id, done } = req.dtoIn;
  res.json({ item: { id, done }, uuAppErrorMap:{} });
});

r.delete('/delete', requireAuth, requireRole(['OWNER','MEMBER']), validate(deleteDtoIn), (req,res)=>{
  res.json({ deleted:true, uuAppErrorMap:{} });
});

export default r;