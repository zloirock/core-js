import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// An iterator read on the realm keeps its fallback when the method is absent.
// Pure dispatch reads the polyfilled realm; global mode retains the native pattern.
const iterator = (_ref = _getIteratorMethod(_globalThis)) === void 0 ? fallback() : _ref;
use(iterator);