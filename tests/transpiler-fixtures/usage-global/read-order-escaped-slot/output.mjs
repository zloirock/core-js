import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A callee can replace an escaped static slot with an instance.
let r;
const w = {
  k: Object
};
const fill = Function("o", "o.k = [1, 2]");
fill(w);
r = w.k.at(-1);
use(r);