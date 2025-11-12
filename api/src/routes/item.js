import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../mw/auth.js';
import { validate } from '../mw/validate.js';
import { listDtoIn, createDtoIn, updateDtoIn, setCompletedDtoIn, deleteDtoIn } from '../validators/item.js';

const r = Router();

r.get('/list', requireAuth, validate(listDtoIn), (req,res)=>{
  res.json({ items:[{ id:'I1', name:'Milk', done:false }], uuAppErrorMap:{} });
});

r.post('/create', requireAuth, validate(createDtoIn), (req,res)=>{
  res.json({ id: uuid(), listId:req.dtoIn.listId, name:req.dtoIn.name, done:false, uuAppErrorMap:{} });
});

r.patch('/update', requireAuth, validate(updateDtoIn), (req,res)=>{
  res.json({ updated:true, id:req.dtoIn.id, name:req.dtoIn.name, uuAppErrorMap:{} });
});

r.patch('/setCompleted', requireAuth, validate(setCompletedDtoIn), (req,res)=>{
  res.json({ updated:true, id:req.dtoIn.id, done:req.dtoIn.done, uuAppErrorMap:{} });
});

r.delete('/delete', requireAuth, validate(deleteDtoIn), (req,res)=>{
  res.json({ deleted:true, id:req.dtoIn.id, uuAppErrorMap:{} });
});

export default r;