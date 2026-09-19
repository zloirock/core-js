import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// Ambiguous constructor aliases select statics through runtime identity checks.
// Each fallback retains the selected receiver and preserves the method call receiver.
function f(c, d) {
  let M0 = Object;
  if (c) M0 = Array;
  let M = M0;
  if (d) M = _Map;
  (M === Array ? _Array$from : M.from.bind(M))([1, 2, 3]);
}
f(true, false);
let loopHeld = Array;
for (const {
  z = loopHeld = Object
} of []) {
  void z;
}
export const y = (loopHeld === Array ? _Array$of : loopHeld.of.bind(loopHeld))(1);
let src = _globalThis.cond ? _Iterator : _Set;
const captured = src;
src = {};
export const use = captured.isDisjointFrom;
var Promise = Promise;
if (_globalThis.cond) Promise = mock;
export const t = Promise.try;