import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a missing-able-ctor residual that re-anchors to the pure constructor must NOT swallow a polyfillable
// default nested in a residual leaf: `nested: { customA = [1].at(0) }` keeps `Array.prototype.at`
// reachable by the natural visitor. anchoring would render the residual verbatim and drop `_at` in both
// emitters; a TOP-LEVEL residual default already bails anchoring, the nested one must bail the same way
const from = _Array$from;
const {
  Set: {
    union,
    nested: {
      customA = _atMaybeArray(_ref = [1]).call(_ref, 0)
    }
  }
} = _globalThis;
export { from, union, customA };