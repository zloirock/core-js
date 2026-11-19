import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A caught receiver can lose its getter and expose the inherited string.
const log = [];
const box = {
  __proto__: {
    data: "pq"
  },
  get data() {
    return [8, 9];
  }
};
try {
  throw box;
} catch (e) {
  delete e.data;
}
const r = box.data.includes("pq");
export { r };
export const effects = log;