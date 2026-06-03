import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// AssignmentExpression cascade flatten with a residual sibling whose default holds an
// instance call. the cascade emits `from = _Array$from` after the rebuilt destructure; the
// residual `other` default `[7].includes(8)` must still polyfill in place (the cascade LHS
// skip used to blanket-suppress the whole pattern, dropping the `_includesMaybeArray` rewrite)
let from, other;
({
  other = _includesMaybeArray(_ref = [7]).call(_ref, 8)
} = _globalThis);
from = _Array$from;
from([9]);
other;