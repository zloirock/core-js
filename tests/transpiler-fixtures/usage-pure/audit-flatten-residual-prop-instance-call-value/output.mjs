import _Array$from from "@core-js/pure/actual/array/from";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// proxy-global nested flatten with a residual sibling whose default holds an instance call
// taking an argument. the flatten extracts `from = _Array$from`; the residual `tail` default
// `[5].findLast(Boolean)` must still polyfill in place to `_findLastMaybeArray(_ref = [5])`,
// memoizing the receiver so it is not evaluated twice
var from = _Array$from;
var {
  tail = _findLastMaybeArray(_ref = [5]).call(_ref, Boolean)
} = _globalThis;
from([6]);
tail;