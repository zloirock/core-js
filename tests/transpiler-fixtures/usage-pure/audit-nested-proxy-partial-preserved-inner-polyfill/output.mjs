import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
const from = _Array$from;
// partial nested flatten: `from` is a plain binding, `of = Array.of` has a default whose
// inner expression is itself polyfillable. both legs must flatten into standalone bindings
// so that `Array.of` inside the default-value-param wrapper is also rewritten to its polyfill
const of = _Array$of === void 0 ? _Array$of : _Array$of;
from([1, 2]);
of(3);