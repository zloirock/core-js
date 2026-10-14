import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A constructor level of the realm read beside an extracted claim, over a sequence init and over a call:
// babel anchors the residual on the level it captures, while unplugin re-reads the root and keeps the level
// in the pattern (the sidecar).
const _ref = (eff(), _globalThis.Array);
const a2 = _atMaybeArray(_ref.prototype);
const {
  foo: b2
} = _ref;
let f3, z3;
function mk() {
  return _globalThis;
}
({
  Array: {
    0: z3
  }
} = mk());
f3 = _Array$of;
export { a2, b2 };