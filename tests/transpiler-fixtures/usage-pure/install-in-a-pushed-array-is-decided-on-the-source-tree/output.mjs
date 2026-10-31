import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref;
// an install in an array literal an instance call pushes is decided on the tree as the source wrote it, before
// pure rebuilds the call around it: it never runs, and the read after it takes the pure import
_pushMaybeArray(_ref = []).call(_ref, [false]);
export const cache = new _WeakMap();