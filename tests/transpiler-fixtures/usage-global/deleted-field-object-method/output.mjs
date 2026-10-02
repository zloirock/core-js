import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Removing an own field can reveal a different inherited receiver family.
const effects = [];
const box = {
  __proto__: {
    data: "pq"
  },
  data: [8, 9],
  remove() {
    delete this.data;
  }
};
box.remove();
const r = box.data.at(-1);
use(r, effects);