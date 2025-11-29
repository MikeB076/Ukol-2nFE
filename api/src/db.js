// api/src/db.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "shopping-list";

let client;
let db;

export async function connectDb() {
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  console.log("✅ MongoDB connected:", uri, "/", dbName);
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("DB not initialized – call connectDb() first.");
  }
  return db;
}

export function shoppingListCollection() {
  return getDb().collection("shopping_lists");
}

export function itemCollection() {
  return getDb().collection("items");
}

export function invitationCollection() {
  return getDb().collection("invitations");
}
export function membershipCollection() {
  // název kolekce může být libovolný, třeba "memberships"
  return getDb().collection('memberships');
}