import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import shoppingList from './routes/shoppingList.js';
import item from './routes/item.js';
import member from './routes/member.js';
import invitation from './routes/invitation.js';
import { ok } from './util.js';

const app = express();
// Allow CORS from a configured origin or fall back to reflecting the request origin (useful in dev)
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

// Simple health check + example usage of ok()
app.get('/api/ping', (req, res) => res.json(ok({ pong: true })));

// API routes (uuCmd)
app.use('/api/shoppingList', shoppingList);
app.use('/api/item', item);
app.use('/api/member', member);
app.use('/api/invitation', invitation);

// 404 + error
app.use((req,res)=>res.status(404).json({ uuAppErrorMap:{ 'api/NotFound':{ message:'Not found' }}}));
app.use((err,req,res,next)=>{
  const status = err.status || 500;
  res.status(status).json({ uuAppErrorMap: err.uuAppErrorMap || { 'api/Unknown': { message: err.message } }});
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));