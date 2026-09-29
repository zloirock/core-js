import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// One unresolved alternative keeps the full includes dispatch set.
const box = {
  data: [10, 20]
};
box.data = flag ? "1020" : foreign;
export const result = box.data.includes("02");