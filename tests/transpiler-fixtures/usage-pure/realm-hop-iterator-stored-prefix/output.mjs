import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// A stored realm source keeps its prefix and exposes iterator claims beside residual reads.
let iterator, object, held;
effect();
({
  Object: object
} = (held = _globalThis, _globalThis));
iterator = _getIteratorMethod(_globalThis.Array.prototype);
export { iterator, object, held };