// Removing an own field can reveal a different inherited receiver family.
const effects = [];
const box = {
  __proto__: {
    data: "pq"
  },
  data: [8, 9]
};
try {
  throw {
    box
  };
} catch ({
  box: e
}) {
  delete e.data;
}
const r = (box.data).at(-1);
use(r, effects);
