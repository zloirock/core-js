import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Catch + computed key [Symbol.iterator]: emitCatchClause extracts the computed key
// transform so composition doesn't corrupt `_Symbol$iterator` into `__Symbol$iterator`.
// `get-iterator-method` is the correct entry binding.
try {
  risky();
} catch (_ref) {
let iter = _getIteratorMethod(_ref);
let { [_Symbol$iterator]: _unused, ...rest } = _ref;
  iter;
  rest;
}