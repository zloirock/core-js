import _at from "@core-js/pure/actual/instance/at";
var _ref;
// An opaque slot write may replace the initial static receiver with an instance.
let r;
const w = {
  k: Object
};
const make = Function("return [1, 2]");
w.k = make();
r = _at(_ref = w.k).call(_ref, -1);
use(r);