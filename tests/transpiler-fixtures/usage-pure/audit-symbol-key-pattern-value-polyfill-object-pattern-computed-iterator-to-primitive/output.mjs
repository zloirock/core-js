import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$toPrimitive from "@core-js/pure/actual/symbol/to-primitive";
// a computed well-known-symbol key INSIDE the extracted pattern stays live and substitutes
const {
  [_Symbol$toPrimitive]: tp
} = _getIteratorMethod([1]);
export { tp };