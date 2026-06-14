import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// regression lock: a `[Symbol.iterator]` key before a consumed static sibling under a proxy-global
// receiver. the receiver memoizes to one `_ref` registered as a global alias, so the symbol key extracts
// `it = _getIteratorMethod(_ref)` AND the sibling static `from` re-polyfills off `_ref` (`const from =
// _Array$from`) - it must not stay native (undefined on ie:11). rest sentinel survives, no compose crash
const _ref = _globalThis.Array;
const it = _getIteratorMethod(_ref);
const from = _Array$from;
const {
  [_Symbol$iterator]: _unused,
  from: _unused2,
  ...rest
} = _ref;
it;
from([1]);
export { it, from, rest };