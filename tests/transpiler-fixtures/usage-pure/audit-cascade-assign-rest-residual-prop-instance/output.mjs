import _Array$from from "@core-js/pure/actual/array/from";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// AssignmentExpression cascade flatten with BOTH a rest sibling and a residual sibling whose
// default holds an instance call. the consumed `Array` key becomes a `_unused` rest sentinel
// (rest exclusion preserved), `from = _Array$from` is emitted after the destructure, and the
// residual `mapped` default `[10].flatMap(String)` must still polyfill in place
let from, mapped, others;
var _unused;
({
  Array: _unused,
  mapped = _flatMapMaybeArray(_ref = [10]).call(_ref, String),
  ...others
} = _globalThis);
from = _Array$from;
from([11]);
mapped;