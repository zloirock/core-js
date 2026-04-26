import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// catch destructure with computed key `[Symbol.iterator]`: the well-known symbol resolves
// to its `get-iterator-method` polyfill helper. extraction must use the original computed
// expression so the polyfill identifier is not double-prefixed
try {
  risky();
} catch (_ref) {
  let iter = _getIteratorMethod(_ref);
  let {
    [_Symbol$iterator]: _unused,
    ...rest
  } = _ref;
  iter;
  rest;
}