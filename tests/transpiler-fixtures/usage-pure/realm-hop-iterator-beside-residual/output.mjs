import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// A realm hop peels before an iterator capture reads its slot beside a residual.
let iterator, object;
({
  Object: object
} = _globalThis);
iterator = _getIteratorMethod(_globalThis.Array.prototype);
export { iterator, object };