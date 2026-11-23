import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Resolve the iterator and its default before the next expression runs.
let method;
const after = (effect(), method = (_ref = _getIteratorMethod(_globalThis)) === void 0 ? fallback() : _ref, finish());