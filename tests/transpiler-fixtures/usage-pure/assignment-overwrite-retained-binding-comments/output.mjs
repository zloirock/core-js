import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// A repeated binding read owns no copy of the retained target's comments.
// Keep each annotation once and in source order.
let method;
({
  [(effect(), _Symbol$iterator)]: /* target annotation */method = /* default annotation */fallback()
} = _globalThis);
method = (_ref = _getIteratorMethod(_globalThis)) === void 0 ? method : _ref;