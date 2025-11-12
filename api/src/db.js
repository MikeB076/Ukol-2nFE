// src/db.js
// Minimal in‑memory store + query helpers for demo & pagination

export const db = {
  lists: [
    { id: 'L1', name: 'Demo list', archived: false },
    { id: 'L2', name: 'BBQ party', archived: true },
    { id: 'L3', name: 'Hardware store', archived: false },
  ],
  items: [
    { id: 'I1',  listId: 'L1', name: 'Milk',  done: false },
    { id: 'I2',  listId: 'L1', name: 'Bread', done: true  },
    { id: 'I3',  listId: 'L1', name: 'Eggs',  done: false },
    { id: 'I4',  listId: 'L1', name: 'Butter',done: false },
    { id: 'I5',  listId: 'L1', name: 'Salt',  done: true  },
    { id: 'I6',  listId: 'L1', name: 'Sugar', done: false },
    { id: 'I7',  listId: 'L1', name: 'Tea',   done: false },
    { id: 'I8',  listId: 'L1', name: 'Coffee',done: true  },
    { id: 'I9',  listId: 'L1', name: 'Rice',  done: false },
    { id: 'I10', listId: 'L1', name: 'Pasta', done: false },
  ],
  memberships: [
    { listId: 'L1', uuIdentity: '0000-1111', role: 'OWNER'  },
    { listId: 'L1', uuIdentity: '2222-3333', role: 'MEMBER' },
  ],
  invitations: [
    // { id:'INV1', listId:'L1', invitedBy:'0000-1111', email:'x@x.cz', status:'PENDING', token:'abc', expiresAt:'2025-12-31' }
  ],
};

// ---- Helpers ---------------------------------------------------------------

// Generic pagination over an array
export function paginate(array, pageInfo = { pageIndex: 0, pageSize: 20 }) {
  const pageIndex = Number(pageInfo?.pageIndex ?? 0);
  const pageSize = Number(pageInfo?.pageSize ?? 20);
  const total = Array.isArray(array) ? array.length : 0;
  const start = pageIndex * pageSize;
  const page = array.slice(start, start + pageSize);
  return { page, pageInfo: { pageIndex, pageSize, total } };
}

// Filter lists by archived + name query (case‑insensitive)
export function filterLists({ archived = false, query = '' } = {}) {
  const byArchive = archived ? db.lists : db.lists.filter(l => !l.archived);
  const q = String(query).trim().toLowerCase();
  return q ? byArchive.filter(l => l.name.toLowerCase().includes(q)) : byArchive;
}

// Get items of a list, optionally hide completed
export function filterItems({ listId, showDone = false } = {}) {
  const all = db.items.filter(i => i.listId === listId);
  return showDone ? all : all.filter(i => !i.done);
}