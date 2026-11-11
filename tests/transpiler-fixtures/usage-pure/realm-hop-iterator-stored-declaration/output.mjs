import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// A stored declaration keeps its effects while the iterator helper owns the read.
let held;
const iterator = _getIteratorMethod((effect(), held = _globalThis, _globalThis.Array.prototype));
const {
  Object: object
} = _globalThis;
export { held, iterator, object };