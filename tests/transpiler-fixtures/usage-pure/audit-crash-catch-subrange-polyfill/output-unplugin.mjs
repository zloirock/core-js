import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// catch-clause rewrite (well-known Symbol key triggers param -> _ref) co-located with a polyfill
// at a SUB-range inside the pattern (an instance-method call in a computed key). the sub-range
// transform must be drained and baked into the relocated prelude, not orphaned inside the bare
// `_ref` overwrite. regression lock
try {} catch (_ref) {
var _ref2;
let it = _getIteratorMethod(_ref);
let { [_atMaybeArray(_ref2 = [1]).call(_ref2, 0)]: b } = _ref; it(); b; }