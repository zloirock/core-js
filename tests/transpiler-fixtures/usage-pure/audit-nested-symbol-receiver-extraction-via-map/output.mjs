import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map from "@core-js/pure/actual/map/constructor";
// a missing-able CTOR root reads through its pure constructor
const viaMap = _getIteratorMethod(_Map.whatever);
export { viaMap };