import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// generalization of the symbol-iterator-key + consumed-static-sibling lock to MULTIPLE statics: every
// sibling static off the proxy-global ctor extracts to its polyfill (`from`, `of`), each key renamed to a
// throwaway, while the symbol key extracts `it = _getIteratorMethod(_ref)`. the memoized `_ref` is
// registered as a global alias so all siblings re-polyfill off it - none stay native (undefined on ie:11)
const _ref = _globalThis.Array;
const it = _getIteratorMethod(_ref);
const from = _Array$from;
const of = _Array$of;
const {
  [_Symbol$iterator]: _unused,
  from: _unused2,
  of: _unused3,
  ...rest
} = _ref;
it;
from([1]);
of(2, 3);
export { it, from, of, rest };