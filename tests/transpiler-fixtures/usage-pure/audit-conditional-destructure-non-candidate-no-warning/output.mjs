import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// A decided selection of constructors without this static keeps the native read.
// Debug output must not report an untouched polyfillable branch.
const cond = true;
const {
  from
} = cond ? _Set : _WeakMap;
from([1, 2, 3]);