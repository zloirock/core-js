import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A callee can replace an escaped static slot with an instance.
let r;
const w = {
  k: Object
};
const fill = Function("o", "o.k = [1, 2]");
fill(w);
r = _at(_ref = w.k).call(_ref, -1);
use(r);