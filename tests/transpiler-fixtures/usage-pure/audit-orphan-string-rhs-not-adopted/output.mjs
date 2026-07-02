import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `_ref = "string-literal"` - StringLiteral RHS is NOT in PLUGIN_EMIT_RHS_TYPES, so the
// user `_ref` stays out of orphan adoption. Plugin allocates its own _ref slot for the
// array.at memoization.
import _fill from '@core-js/pure/actual/array/fill';
var _ref2;
_ref = "literal";
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);