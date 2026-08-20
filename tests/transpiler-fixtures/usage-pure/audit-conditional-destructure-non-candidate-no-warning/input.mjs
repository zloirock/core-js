// a conditional-receiver destructure whose key is NOT a genuine candidate on EITHER branch:
// Set and WeakMap carry no pure static `from`. the viability gate finds no polyfillable branch,
// so NO warning is emitted - it would falsely call `from` a candidate. the bare branch idents
// are still substituted (both polyfilled); only the warning is suppressed. locks the gate.
const cond = true;
const { from } = cond ? Set : WeakMap;
from([1, 2, 3]);
