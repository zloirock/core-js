import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A getter body can replace the receiver prototype before an inherited read.
const log = [];
const box = {
  get setup() {
    Object.setPrototypeOf(this, {
      toString: "pq"
    });
    return 0;
  }
};
void box.setup;
const r = box.toString.includes("pq");
export { r };
export const effects = log;