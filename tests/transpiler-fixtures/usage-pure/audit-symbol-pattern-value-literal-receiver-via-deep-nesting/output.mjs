import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref;
// Nested defaults keep their polyfills through deeper pattern values.
const {
  next: {
    length: deepLen = _toSplicedMaybeArray(_ref = [1]).call(_ref, 0, 1)
  }
} = _getIteratorMethod([13]);
export const viaDeepNesting = deepLen;