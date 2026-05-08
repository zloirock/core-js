import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2;
// Nested-proxy flatten on declarator [0] runs alongside an instance-polyfill on declarator [1].
// Pending-ref splices inside the preserved declarator's range must merge cleanly with the flatten overwrite.
let from = _Array$from;
let x = (sideEffect(), _atMaybeArray(_ref = (sideEffect(), [1, 2, 3])).call(_ref, -1));
let of = _Array$of;
let y = (sideEffect(), _findLastMaybeArray(_ref2 = (sideEffect(), [4, 5, 6])).call(_ref2, v => v > 0));
export { from, x, of, y };