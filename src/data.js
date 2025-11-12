// src/data.js
export const DEFAULT_DATA = {
  version: 1,
  currentUserId: "u1",
  lists: [
    {
      id: "l1",
      name: "Nákup na víkend",
      archived: false,
      ownerId: "u1",
      itemsCount: 2,
      doneCount: 0,
      items: [
        { id: "i1", text: "Mléko 2×", done: false },
        { id: "i2", text: "Máslo",    done: false },
      ],
    },
    {
      id: "l2",
      name: "Party gril",
      archived: false,
      ownerId: "u2",
      itemsCount: 0,
      doneCount: 0,
      items: [],
    },
  ],
};