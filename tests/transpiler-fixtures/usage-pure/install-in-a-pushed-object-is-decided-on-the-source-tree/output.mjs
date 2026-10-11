import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref;
// an install in an object literal an instance call pushes is decided on the tree as the source wrote it, before
// pure rebuilds the call around it: it never runs, and the read after it takes the pure import
_pushMaybeArray(_ref = []).call(_ref, {
  shim: false
});
export const unique = new _Set(list);