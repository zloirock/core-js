import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// A discarded keyed assignment keeps its default in the raw slot.
// The overwrite follows it inside the sequence and reads the substituted realm.
let method;
const after = ({
  [(effect(), _Symbol$iterator)]: method = fallback()
} = _globalThis, method = (_ref = _getIteratorMethod(_globalThis)) === void 0 ? method : _ref, finish());