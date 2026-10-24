import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A destructured catch alias can delete the installed getter.
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
  throw {
    box
  };
} catch ({
  box: e
}) {
  delete e.data;
}
const r = box.data.includes("pq");
export { r };
export const effects = log;