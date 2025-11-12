import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../mw/auth.js';
import { validate } from '../mw/validate.js';
import { createDtoIn, getDtoIn, updateDtoIn, deleteDtoIn, listMineDtoIn } from '../validators/shoppingList.js';
import { requireRole } from '../mw/roles.js';

const r = Router();

r.post('/create', requireAuth, requireRole(['OWNER']), validate(createDtoIn), (req, res) => {
  const id = uuid();
  res
    .status(201)
    .set('Location', `/api/shoppingList/get?id=${id}`)
    .json({ list: { id, name: req.dtoIn.name, archived: false }, uuAppErrorMap: {} });
});

r.get('/get', requireAuth, requireRole(['OWNER', 'MEMBER']), validate(getDtoIn), (req,res)=>{
  res.json({ list: { id: req.dtoIn.id, name: 'Groceries', archived: false }, uuAppErrorMap: {} });
});

r.patch('/update', requireAuth, requireRole(['OWNER']), validate(updateDtoIn), (req, res) => {
  const { id, name, archived } = req.dtoIn;
  const list = { id };
  if (typeof name === 'string') list.name = name;
  if (typeof archived === 'boolean') list.archived = archived;
  res.json({ list, uuAppErrorMap: {} });
});

r.delete('/delete', requireAuth, requireRole(['OWNER']), validate(deleteDtoIn), (req,res)=>{
  res.json({ deleted:true, id:req.dtoIn.id, uuAppErrorMap:{} });
});

r.get('/listByMyAccess', requireAuth, requireRole(['OWNER', 'MEMBER']), validate(listMineDtoIn), (req, res) => {
  const { archived, query, pageInfo } = req.dtoIn;

  // Demo dataset (simulate that some lists are archived)
  const all = [
    { id: 'L1', name: 'Groceries', archived: false },
    { id: 'L2', name: 'BBQ',       archived: true  },
    { id: 'L3', name: 'Hardware',  archived: false },
  ];

  // If archived==true → include archived lists too; if false → show only non-archived
  const byArchive = archived ? all : all.filter(l => !l.archived);

  const q = (query || '').trim().toLowerCase();
  const filtered = q ? byArchive.filter(l => l.name.toLowerCase().includes(q)) : byArchive;

  const { pageIndex = 0, pageSize = 20 } = pageInfo || {};
  const total = filtered.length;
  const start = pageIndex * pageSize;
  const page = filtered.slice(start, start + pageSize);

  res.json({ itemList: page, pageInfo: { pageIndex, pageSize, total }, uuAppErrorMap: {} });
});

export default r;