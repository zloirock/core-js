import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A captured assignment result cannot be replaced by its extracted method.
let method;
const captured = (effect(), method = (_ref = _getIteratorMethod(_globalThis)) === void 0 ? fallback() : _ref, _globalThis);