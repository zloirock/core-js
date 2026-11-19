import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// Deleting an own getter exposes the inherited string without invoking the removed getter.
const log = [];
const box = {
  __proto__: {
    data: "pq"
  },
  get data() {
    log.push("get");
    return [8, 9];
  }
};
delete box.data;
const r = box.data.includes("pq");
export { r };
export const effects = log;