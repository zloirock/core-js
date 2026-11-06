// proxy-global nested flatten with a residual sibling whose default holds an instance call
// taking an argument. the flatten extracts `from = _Array$from`; the residual `tail` default
// `[5].findLast(Boolean)` must still polyfill in place to `_findLastMaybeArray(_ref = [5])`,
// memoizing the receiver so it is not evaluated twice
var { Array: { from }, tail = [5].findLast(Boolean) } = globalThis;
from([6]);
tail;
