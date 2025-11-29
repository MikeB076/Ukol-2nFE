import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { itemCollection } from "../db.js";
import { requireAuth } from '../mw/auth.js';
import { validate } from '../mw/validate.js';
import {
  createDtoIn,
  getDtoIn,
  updateDtoIn,
  deleteDtoIn,
  listMineDtoIn,
} from '../validators/shoppingList.js';
import { requireRole } from '../mw/roles.js';
import { shoppingListCollection, membershipCollection  } from '../db.js';
import { ok, badDto } from '../util.js';
const r = Router();

// Helper – convert Mongo list doc to dtoOut
function toListDto(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    name: doc.name,
    archived: !!doc.archived,
  };
}

/**
 * POST /api/shoppingList/create
 * profiles: [Authenticated]
 * Business: volající se stává OWNER daného listu
 * dtoIn:  { name }
 * dtoOut: { list:{ id,name,archived }, uuAppErrorMap:{} }
 */
r.post(
  '/create',
  requireAuth,
  // requireRole here pouze simuluje business roli OWNER v zadání
  requireRole(['OWNER']),
  validate(createDtoIn),
  async (req, res, next) => {
    try {
      const col = shoppingListCollection();
      const id = uuid();
      const now = new Date();

      const doc = {
        _id: id,
        name: req.dtoIn.name,
        archived: false,
        ownerId: req.user.uuIdentity,
        createdAt: now,
        updatedAt: now,
      };

      await col.insertOne(doc);

      return res
        .status(201)
        .set('Location', `/api/shoppingList/get?id=${id}`)
        .json(ok({ list: toListDto(doc) }));
    } catch (e) {
      next(e);
    }
  },
);

/**
 * GET /api/shoppingList/get
 * profiles: [Authenticated]
 * Business: OWNER nebo MEMBER daného listu
 * dtoIn:  { id }
 * dtoOut: { list:{...}, uuAppErrorMap:{} }
 */
r.get(
  '/get',
  requireAuth,
  requireRole(['OWNER', 'MEMBER']),
  validate(getDtoIn),
  async (req, res, next) => {
    try {
      const { id } = req.dtoIn;
      const listCol = shoppingListCollection();
      const memCol = membershipCollection();
      const me = req.user.uuIdentity;

      const list = await listCol.findOne({ _id: id });
      if (!list) {
        return res.status(400).json(badDto({ id: 'ListDoesNotExist' }));
      }

      const isOwner = list.ownerId === me;
      const membership = await memCol.findOne({ listId: id, uuIdentity: me });
      const isMember = !!membership;

      if (!isOwner && !isMember) {
        return res.status(403).json(badDto({ auth: 'Forbidden' }));
      }

      return res.json(ok({ list: toListDto(list) }));
    } catch (e) {
      next(e);
    }
  },
);

/**
 * PATCH /api/shoppingList/update
 * profiles: [Authenticated]
 * Business: pouze OWNER daného listu
 * dtoIn:  { id, name?, archived? }
 * dtoOut: { list:{...}, uuAppErrorMap:{} }
 */
r.patch(
  '/update',
  requireAuth,
  requireRole(['OWNER']),
  validate(updateDtoIn),
  async (req, res, next) => {
    try {
      const { id, name, archived } = req.dtoIn;
      const listCol = shoppingListCollection();
      const me = req.user.uuIdentity;

      const list = await listCol.findOne({ _id: id });
      if (!list) {
        return res.status(400).json(badDto({ id: 'ListDoesNotExist' }));
      }

      if (list.ownerId !== me) {
        return res.status(403).json(badDto({ auth: 'NotOwner' }));
      }

      const update = {};
      if (typeof name === 'string') update.name = name;
      if (typeof archived === 'boolean') update.archived = archived;
      if (Object.keys(update).length === 0) {
        return res.json(ok({ list: toListDto(list) }));
      }

      update.updatedAt = new Date();

      const result = await listCol.findOneAndUpdate(
        { _id: id },
        { $set: update },
        { returnDocument: 'after' },
      );

      const updated = result.value || { ...list, ...update };
      return res.json(ok({ list: toListDto(updated) }));
    } catch (e) {
      next(e);
    }
  },
);

/**
 * DELETE /api/shoppingList/delete
 * profiles: [Authenticated]
 * Business: pouze OWNER daného listu
 * dtoIn:  { id }
 * dtoOut: { deleted:true, uuAppErrorMap:{} }
 */
r.delete(
  '/delete',
  requireAuth,
  requireRole(['OWNER']),
  validate(deleteDtoIn),
  async (req, res, next) => {
    try {
      const { id } = req.dtoIn;

      const listCol = shoppingListCollection();
      const memCol = membershipCollection();
      const itemsCol = itemCollection(); // POZOR: tohle je kolekce

      const me = req.user.uuIdentity;

      // 1) najdeme seznam
      const list = await listCol.findOne({ _id: id });
      if (!list) {
        return res
          .status(400)
          .json(badDto('ListDoesNotExist', { id }));
      }

      // 2) ověříme, že jsem OWNER
      if (list.ownerId !== me) {
        return res
          .status(403)
          .json(badDto('NotOwner', { ownerId: list.ownerId, me }));
      }

      // 3) smažeme seznam + členství + položky
      await listCol.deleteOne({ _id: id });
      await memCol.deleteMany({ listId: id });
      await itemsCol.deleteMany({ listId: id }); // TADY NENÍ itemCollection, ale itemsCol

      return res.json(ok({ deleted: true }));
    } catch (e) {
      next(e);
    }
  }
);
/**
 * GET /api/shoppingList/listByMyAccess
 * profiles: [Authenticated]
 * Business: přihlášený uživatel – vrací listy, kde je OWNER nebo MEMBER
 * dtoIn:  { archived, query, pageInfo:{ pageIndex, pageSize } }
 * dtoOut: { itemList:[{ id,name,archived }], pageInfo:{...}, uuAppErrorMap:{} }
 */
r.get(
  '/listByMyAccess',
  requireAuth,
  validate(listMineDtoIn),
  async (req, res, next) => {
    try {
      const { archived = false, query = '', pageInfo = {} } = req.dtoIn;
      const listCol = shoppingListCollection();
      const memCol = membershipCollection();
      const me = req.user.uuIdentity;

      const { pageIndex = 0, pageSize = 20 } = pageInfo;

      // nejdřív zjistit listy, kde jsem MEMBER
      const myMemberships = await memCol.find({ uuIdentity: me }).toArray();
      const memberListIds = myMemberships.map((m) => m.listId);

      const filter = {
        $or: [{ ownerId: me }, { _id: { $in: memberListIds } }],
      };

      // archived=false → jen nearchivované; true → všechny (owner i archived)
      if (!archived) {
        filter.archived = false;
      }

      if (query && query.trim() !== '') {
        filter.name = { $regex: query.trim(), $options: 'i' };
      }

      const total = await listCol.countDocuments(filter);

      const docs = await listCol
        .find(filter)
        .skip(pageIndex * pageSize)
        .limit(pageSize)
        .sort({ name: 1 })
        .toArray();

      const itemList = docs.map(toListDto);

      return res.json(
        ok({
          itemList,
          pageInfo: {
            pageIndex,
            pageSize,
            total,
          },
        }),
      );
    } catch (e) {
      next(e);
    }
  },
);

export default r;