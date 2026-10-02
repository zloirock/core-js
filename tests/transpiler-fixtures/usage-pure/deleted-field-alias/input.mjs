// Removing an own field can reveal a different inherited receiver family.
const effects = [];
const box = {
  __proto__: {
    data: "pq"
  },
  data: [8, 9]
};
const alias = box;
delete alias.data;
const r = (box.data).at(-1);
use(r, effects);
