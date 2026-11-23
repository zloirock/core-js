import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// The key, iterator lookup and default all belong to the unbraced branch.
let method;
if (enabled) effect(), method = (_ref = _getIteratorMethod(_globalThis)) === void 0 ? fallback() : _ref;