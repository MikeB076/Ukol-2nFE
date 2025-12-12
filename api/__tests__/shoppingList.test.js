import request from "supertest";
import { jest } from "@jest/globals";

/**
 * Helper: mock Mongo cursor chain .find().skip().limit().sort().toArray()
 */
function mockCursor(resultArray) {
  return {
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue(resultArray),
  };
}

// ---------- Mocks (ESM) ----------
const listColMock = {
  insertOne: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
};

const memColMock = {
  findOne: jest.fn(),
  find: jest.fn(),
  deleteMany: jest.fn(),
};

const itemsColMock = {
  deleteMany: jest.fn(),
};

// uuid mock => deterministic id
await jest.unstable_mockModule("uuid", () => ({
  v4: () => "list-123",
}));

// MW mocks: requireAuth + requireRole + validate
await jest.unstable_mockModule("../src/mw/auth.js", () => ({
  requireAuth: (req, res, next) => {
    req.user = { uuIdentity: "me" };
    next();
  },
}));

await jest.unstable_mockModule("../src/mw/roles.js", () => ({
  requireRole: () => (req, res, next) => next(),
}));

await jest.unstable_mockModule("../src/mw/validate.js", () => ({
  validate: () => (req, res, next) => {
    // unify dtoIn for GET/DELETE (query) and POST/PATCH (body)
    req.dtoIn = (req.method === "GET" || req.method === "DELETE") ? req.query : req.body;
    next();
  },
}));

// db mocks: shoppingListCollection, membershipCollection, itemCollection
await jest.unstable_mockModule("../src/db.js", () => ({
  shoppingListCollection: () => listColMock,
  membershipCollection: () => memColMock,
  itemCollection: () => itemsColMock,
  // if server imports connectDb, keep it harmless
  connectDb: async () => {},
}));

// IMPORTANT: import app AFTER mocks
const { default: app } = await import("../src/server.js");

// ---------- Tests ----------
describe("shoppingList routes (UNIT)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1) CREATE
  test("POST /api/shoppingList/create - happy day (201, Location, list dtoOut)", async () => {
    listColMock.insertOne.mockResolvedValue({ acknowledged: true });

    const res = await request(app)
      .post("/api/shoppingList/create")
      .send({ name: "My List" });

    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toBe("/api/shoppingList/get?id=list-123");

    // ok({ list: {id,name,archived}, uuAppErrorMap })
    expect(res.body).toHaveProperty("list");
    expect(res.body.list).toMatchObject({
      id: "list-123",
      name: "My List",
      archived: false,
    });

    expect(listColMock.insertOne).toHaveBeenCalled();
  });

  test("POST /api/shoppingList/create - alternative (DB error -> 500)", async () => {
    listColMock.insertOne.mockRejectedValue(new Error("DB fail"));

    const res = await request(app)
      .post("/api/shoppingList/create")
      .send({ name: "X" });

    expect(res.statusCode).toBeGreaterThanOrEqual(500);
  });

  // 2) GET
  test("GET /api/shoppingList/get - happy day (owner access)", async () => {
    listColMock.findOne.mockResolvedValue({
      _id: "list-1",
      name: "A",
      archived: false,
      ownerId: "me",
    });

    memColMock.findOne.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/shoppingList/get")
      .query({ id: "list-1" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("list");
    expect(res.body.list).toMatchObject({
      id: "list-1",
      name: "A",
      archived: false,
    });
  });

  test("GET /api/shoppingList/get - alternative (not found -> 400)", async () => {
    listColMock.findOne.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/shoppingList/get")
      .query({ id: "missing" });

    expect(res.statusCode).toBe(400);
  });

  test("GET /api/shoppingList/get - alternative (forbidden -> 403)", async () => {
    listColMock.findOne.mockResolvedValue({
      _id: "list-2",
      name: "B",
      archived: false,
      ownerId: "someone-else",
    });
    memColMock.findOne.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/shoppingList/get")
      .query({ id: "list-2" });

    expect(res.statusCode).toBe(403);
  });

  // 3) UPDATE
  test("PATCH /api/shoppingList/update - happy day (owner updates name)", async () => {
    listColMock.findOne.mockResolvedValue({
      _id: "list-3",
      name: "Old",
      archived: false,
      ownerId: "me",
    });

    listColMock.findOneAndUpdate.mockResolvedValue({
      value: { _id: "list-3", name: "New", archived: false, ownerId: "me" },
    });

    const res = await request(app)
      .patch("/api/shoppingList/update")
      .send({ id: "list-3", name: "New" });

    expect(res.statusCode).toBe(200);
    expect(res.body.list).toMatchObject({ id: "list-3", name: "New", archived: false });
    expect(listColMock.findOneAndUpdate).toHaveBeenCalled();
  });

  test("PATCH /api/shoppingList/update - alternative (not owner -> 403)", async () => {
    listColMock.findOne.mockResolvedValue({
      _id: "list-4",
      name: "X",
      archived: false,
      ownerId: "someone-else",
    });

    const res = await request(app)
      .patch("/api/shoppingList/update")
      .send({ id: "list-4", name: "Y" });

    expect(res.statusCode).toBe(403);
  });

  // 4) DELETE
  test("DELETE /api/shoppingList/delete - happy day (owner deletes list + memberships + items)", async () => {
    listColMock.findOne.mockResolvedValue({
      _id: "list-5",
      ownerId: "me",
      name: "To delete",
      archived: false,
    });

    listColMock.deleteOne.mockResolvedValue({ deletedCount: 1 });
    memColMock.deleteMany.mockResolvedValue({ deletedCount: 2 });
    itemsColMock.deleteMany.mockResolvedValue({ deletedCount: 10 });

    const res = await request(app)
      .delete("/api/shoppingList/delete")
      .query({ id: "list-5" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ deleted: true });

    expect(listColMock.deleteOne).toHaveBeenCalledWith({ _id: "list-5" });
    expect(memColMock.deleteMany).toHaveBeenCalledWith({ listId: "list-5" });
    expect(itemsColMock.deleteMany).toHaveBeenCalledWith({ listId: "list-5" });
  });

  test("DELETE /api/shoppingList/delete - alternative (not found -> 400)", async () => {
    listColMock.findOne.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/shoppingList/delete")
      .query({ id: "missing" });

    expect(res.statusCode).toBe(400);
  });

  // 5) LIST (listByMyAccess)
  test("GET /api/shoppingList/listByMyAccess - happy day (returns itemList + pageInfo)", async () => {
    // memberships where I'm member
    memColMock.find.mockReturnValue(mockCursor([{ listId: "L1" }, { listId: "L2" }]));

    listColMock.countDocuments.mockResolvedValue(2);
    listColMock.find.mockReturnValue(mockCursor([
      { _id: "L1", name: "Alpha", archived: false },
      { _id: "L2", name: "Beta", archived: false },
    ]));

    const res = await request(app)
      .get("/api/shoppingList/listByMyAccess")
      .query({ archived: "false", query: "", "pageInfo[pageIndex]": 0, "pageInfo[pageSize]": 20 });

    // Pozn.: validate mock bere req.query rovnou, takže pageInfo zůstane stringově;
    // pro účely UNIT testu nám stačí ověřit strukturu + data.
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("itemList");
    expect(res.body.itemList).toHaveLength(2);
    expect(res.body.itemList[0]).toHaveProperty("id");
    expect(res.body).toHaveProperty("pageInfo");
  });

  test("GET /api/shoppingList/listByMyAccess - alternative (DB error -> 500)", async () => {
    memColMock.find.mockImplementation(() => {
      throw new Error("DB fail");
    });

    const res = await request(app)
      .get("/api/shoppingList/listByMyAccess")
      .query({ archived: "false" });

    expect(res.statusCode).toBeGreaterThanOrEqual(500);
  });
});