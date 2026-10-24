import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a conditional-receiver destructure whose key is NOT a genuine candidate on EITHER branch:
// Set and WeakMap carry no pure static `from`. the viability gate finds no polyfillable branch,
// so NO warning is emitted - it would falsely call `from` a candidate. the bare branch idents
// are still substituted (both polyfilled); only the warning is suppressed. locks the gate.
const cond = true;
const {
  from
} = cond ? _Set : _WeakMap;
from([1, 2, 3]);