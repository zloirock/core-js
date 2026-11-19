import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// Replacing an array getter with a string value invalidates the getter return proof.
const log = [];
const box = {
  get data() {
    return [8, 9];
  }
};
Object.defineProperty(box, "data", {
  value: "pq"
});
const r = box.data.includes("pq");
export { r };
export const effects = log;