import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// The raw keyed default and its overwrite stay inside the unbraced branch.
// A realm rewrite must remain visible to the later receiver read.
let method;
if (enabled) {
  ({
    [(effect(), _Symbol$iterator)]: method = fallback()
  } = _globalThis);
  method = (_ref = _getIteratorMethod(_globalThis)) === void 0 ? method : _ref;
}