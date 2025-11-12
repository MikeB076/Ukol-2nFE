// src/db.js
export const db = {
  lists: [
    { id: "L1", name: "Demo list", archived: false },
  ],
  items: [
    { id: "I1", listId: "L1", name: "Milk", done: false },
  ],
  memberships: [
    { listId: "L1", uuIdentity: "0000-1111", role: "OWNER" },
    { listId: "L1", uuIdentity: "2222-3333", role: "MEMBER" },
  ],
  invitations: [
    // { id:"INV1", listId:"L1", invitedBy:"0000-1111", email:"x@x.cz", status:"PENDING", token:"abc", expiresAt:"2025-12-31" }
  ],
};