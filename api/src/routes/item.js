import { Router } from 'express';
import { ObjectId } from 'mongodb';

import { requireAuth } from '../mw/auth.js';
import { requireRole } from '../mw/roles.js';
import { validate } from '../mw/validate.js';
import {
  listDtoIn,
  createDtoIn,
  updateDtoIn,
  setCompletedDtoIn,
  deleteDtoIn,
} from '../validators/item.js';
import { itemCollection } from '../db.js';
import { ok, badDto } from '../util.js';

const r = Router();

// helper – převod Mongo dokumentu na dtoOut item
function toItemDto(doc) {
  return {
    id: doc.id ?? String(doc._id),
    listId: doc.listId,
    name: doc.name,
    done: !!doc.done,
  };
}

// 🔹 pomocná funkce na převod string id → ObjectId
function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

/**
 * GET /api/item/list
 */
r.get(
  '/list',
  requireAuth,
  requireRole(['OWNER', 'MEMBER']),
  validate(listDtoIn),
  async (req, res, next) => {
    try {
      const { listId, showDone = false, pageInfo = {} } = req.dtoIn;
      const { pageIndex = 0, pageSize = 50 } = pageInfo;

      const col = itemCollection();

      const filter = { listId };
      if (!showDone) {
        filter.done = false;
      }

      const total = await col.countDocuments(filter);

      const cursor = col
        .find(filter)
        .skip(pageIndex * pageSize)
        .limit(pageSize)
        .sort({ _id: 1 });

      const docs = await cursor.toArray();
      const itemList = docs.map(toItemDto);

      return res.json(
        ok({
          itemList,
          pageInfo: { pageIndex, pageSize, total },
        }),
      );
    } catch (e) {
      next(e);
    }
  },
);

/**
 * POST /api/item/create
 */
r.post(
  '/create',
  requireAuth,
  requireRole(['OWNER', 'MEMBER']),
  validate(createDtoIn),
  async (req, res, next) => {
    try {
      const { listId, name } = req.dtoIn;
      const col = itemCollection();
      const doc = {
        listId,
        name,
        done: false,
      };

      const result = await col.insertOne(doc);
      doc._id = result.insertedId;      // doplníme _id, aby šel přes toItemDto

      const item = toItemDto(doc);
      return res.status(201).json(ok({ item }));
    } catch (e) {
      next(e);
    }
  },
);

/**
 * PATCH /api/item/update
 * Mění jen název (done řeší setCompleted).
 */
r.patch(
  '/update',
  requireAuth,
  requireRole(['OWNER', 'MEMBER']),
  validate(updateDtoIn),
  async (req, res, next) => {
    try {
      const { id, name } = req.dtoIn;
      const col = itemCollection();

      // převedeme id na ObjectId
      const _id = toObjectId(id);
      if (!_id) {
        return res.status(400).json(badDto({ id: 'InvalidIdFormat' }));
      }

      const update = {};
      if (typeof name === 'string') update.name = name;

      const result = await col.findOneAndUpdate(
        { _id },              // hledáme podle _id
        { $set: update },
        { returnDocument: 'after' },
      );

      if (!result.value) {
        return res
          .status(400)
          .json(badDto({ id: 'ItemDoesNotExist' }));
      }

      const item = toItemDto(result.value);
      return res.json(ok({ item }));
    } catch (e) {
      next(e);
    }
  },
);

/**
 * PATCH /api/item/setCompleted
 * Nastaví příznak done.
 */
r.patch(
  '/setCompleted',
  requireAuth,
  requireRole(['OWNER', 'MEMBER']),
  validate(setCompletedDtoIn),
  async (req, res, next) => {
    try {
      const { id, done } = req.dtoIn;
      const col = itemCollection();

      const _id = toObjectId(id);
      if (!_id) {
        return res.status(400).json(badDto({ id: 'InvalidIdFormat' }));
      }

      const result = await col.findOneAndUpdate(
        { _id },              // opět podle _id
        { $set: { done } },
        { returnDocument: 'after' },
      );

      console.log('SET COMPLETED result:', result.value);

      if (!result.value) {
        return res
          .status(400)
          .json(badDto({ id: 'ItemDoesNotExist' }));
      }

      const item = toItemDto(result.value);
      return res.json(ok({ item }));
    } catch (e) {
      next(e);
    }
  },
);

/**
 * DELETE /api/item/delete
 */
r.delete(
  '/delete',
  requireAuth,
  requireRole(['OWNER', 'MEMBER']),
  validate(deleteDtoIn),
  async (req, res, next) => {
    try {
      const { id } = req.dtoIn;
      const col = itemCollection();

      const _id = toObjectId(id);
      if (!_id) {
        return res.status(400).json(badDto({ id: 'InvalidIdFormat' }));
      }

      const result = await col.deleteOne({ _id });

      if (!result.deletedCount) {
        return res.status(400).json(badDto({ id: 'ItemDoesNotExist' }));
      }

      return res.json(ok({ deleted: true }));
    } catch (e) {
      next(e);
    }
  },
);

export default r;