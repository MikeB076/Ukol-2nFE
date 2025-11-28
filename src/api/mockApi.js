// src/api/mockApi.js

// ----- Mock seznamy -----
let mockLists = [
  {
    id: "list-1",
    name: "Nákup na víkend",
    ownerId: "u1",
    archived: false,
  },
  {
    id: "list-2",
    name: "Party gril",
    ownerId: "u2",
    archived: false,
  },
];

// ----- Mock položky -----
let mockItems = {
  "list-1": [
    { id: "i1", text: "Chléb", done: true },
    { id: "i2", text: "Máslo", done: false },
  ],
  "list-2": [
    { id: "i5", text: "Uhlí", done: false },
    { id: "i6", text: "Pivo", done: false },
  ],
};

// Pomocná funkce – dopočítá itemsCount a doneCount
function withStats(list) {
  const items = mockItems[list.id] || [];
  const itemsCount = items.length;
  const doneCount = items.filter((i) => i.done).length;
  return { ...list, itemsCount, doneCount };
}

// ====== API: přehled seznamů ======
async function fetchListsOverview() {
  // simulace latency
  await new Promise((r) => setTimeout(r, 200));
  return mockLists.map(withStats);
}

// ====== API: detail seznamu ======
async function fetchListDetail(id) {
  await new Promise((r) => setTimeout(r, 150));

  const list = mockLists.find((l) => l.id === id);
  if (!list) throw new Error("List not found");

  return {
    ...withStats(list),
    items: mockItems[id] || [],
  };
}

// ====== API: vytvoření seznamu ======
async function createList(name, ownerId) {
  await new Promise((r) => setTimeout(r, 150));

  const newList = {
    id: `list-${Date.now()}`,
    name,
    ownerId,
    archived: false,
  };

  mockLists = [newList, ...mockLists];
  mockItems[newList.id] = [];

  return withStats(newList);
}

// ====== API: smazání seznamu ======
async function deleteList(id) {
  await new Promise((r) => setTimeout(r, 150));

  mockLists = mockLists.filter((l) => l.id !== id);
  delete mockItems[id];
  return true;
}

// ====== API: položky – přidání ======
async function addItem(listId, text) {
  await new Promise((r) => setTimeout(r, 100));

  const newItem = {
    id: `i-${Date.now()}`,
    text,
    done: false,
  };

  if (!mockItems[listId]) mockItems[listId] = [];
  mockItems[listId].push(newItem);

  return newItem;
}

// ====== API: položky – update ======
async function updateItem(listId, itemId, patch) {
  await new Promise((r) => setTimeout(r, 100));

  const items = mockItems[listId] || [];
  const item = items.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found");

  Object.assign(item, patch);
  return item;
}

// ====== API: položky – smazání ======
async function deleteItem(listId, itemId) {
  await new Promise((r) => setTimeout(r, 100));

  const items = mockItems[listId] || [];
  mockItems[listId] = items.filter((i) => i.id !== itemId);

  return true;
}

// ====== JEDINÝ export blok ======
export {
  fetchListsOverview,
  fetchListDetail,
  createList,
  deleteList,
  addItem,
  updateItem,
  deleteItem,
};