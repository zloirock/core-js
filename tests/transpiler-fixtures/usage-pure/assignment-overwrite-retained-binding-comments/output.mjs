import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Keep each annotation once on its original target or default.
let method;
effect(), /* target annotation */method = (_ref = _getIteratorMethod(_globalThis)) === void 0 ? /* default annotation */fallback() : _ref;