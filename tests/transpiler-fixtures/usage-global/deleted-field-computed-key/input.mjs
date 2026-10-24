// Removing an own field can reveal a different inherited receiver family.
const effects = [];
const box = {
  __proto__: {
    data: "pq"
  },
  data: [8, 9]
};
const key = "data";
delete box[(effects.push("delete"), key)];
const r = (box.data).at(-1);
use(r, effects);
