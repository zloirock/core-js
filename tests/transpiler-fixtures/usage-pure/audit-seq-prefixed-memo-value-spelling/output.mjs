import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// an effect-bearing SEQUENCE around the value a dispatch memoizes: the effect runs where the source
// wrote it and the navigation collapses beside it, inside the same sequence. the render lands in
// the sequence TAIL for exactly that reason - replacing the whole stored value swallowed the prefix,
// and reading the value without descending it left the source read raw in one consumer and
// collapsed in the other
let out;
function eff() {}
const {
  trunc
} = null == (_ref = (eff(), null == _globalThis.window ? void 0 : _self)) ? void 0 : _atMaybeArray(_ref.Array.prototype).Math;
out = null == (_ref2 = (eff(), null == _globalThis.window ? void 0 : _self)) ? void 0 : _atMaybeArray(_ref2.Array.prototype);
export { trunc, out };