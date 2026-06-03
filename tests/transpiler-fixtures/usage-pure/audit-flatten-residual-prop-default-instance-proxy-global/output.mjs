import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// proxy-global nested flatten with a residual sibling whose default holds an instance call.
// the flatten extracts `from = _Array$from` and rebuilds the residual destructure; the
// residual `other` default `[1].at(0)` must still be polyfilled in place (was dropped when
// the whole pattern was blanket-skipped), so both plugins emit the `_atMaybeArray` rewrite
var from = _Array$from;
var {
  other = _atMaybeArray(_ref = [1]).call(_ref, 0)
} = _globalThis;
from([2]);
other;