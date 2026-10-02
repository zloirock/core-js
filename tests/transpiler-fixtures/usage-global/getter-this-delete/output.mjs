import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A receiver method can delete its own getter before the next read.
const log = [];
const box = {
  __proto__: {
    data: "pq"
  },
  get data() {
    return [8, 9];
  },
  remove() {
    delete this.data;
  }
};
box.remove();
const r = box.data.includes("pq");
export { r };
export const effects = log;