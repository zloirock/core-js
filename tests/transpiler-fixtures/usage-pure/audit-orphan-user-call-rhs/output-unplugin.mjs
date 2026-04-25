import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// user-authored top-level `_ref = foo()` as an ExpressionStatement. the bare-statement
// position is never something the plugin emits - orphan adoption heuristic rejects it
// regardless of RHS complexity. user's own pure import of fill stays intact; plugin's
// separate array.at polyfill allocates its own ref without touching the user's `_ref`
import _fill from '@core-js/pure/actual/array/fill';
_ref = helper();
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);
function helper() { return 42; }