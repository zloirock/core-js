// proxy-global nested flatten with a residual sibling whose default holds an instance call.
// the flatten extracts `from = _Array$from` and rebuilds the residual destructure; the
// residual `other` default `[1].at(0)` must still be polyfilled in place (was dropped when
// the whole pattern was blanket-skipped), so both plugins emit the `_atMaybeArray` rewrite
var { Array: { from }, other = [1].at(0) } = globalThis;
from([2]);
other;
