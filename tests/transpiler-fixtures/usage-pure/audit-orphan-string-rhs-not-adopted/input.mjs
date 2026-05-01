// `_ref = "string-literal"` - StringLiteral RHS is NOT in PLUGIN_EMIT_RHS_TYPES, so the
// user `_ref` stays out of orphan adoption. Plugin allocates its own _ref slot for the
// array.at memoization.
import _fill from '@core-js/pure/actual/array/fill';
_ref = "literal";
[1, 2, 3].at(0);
