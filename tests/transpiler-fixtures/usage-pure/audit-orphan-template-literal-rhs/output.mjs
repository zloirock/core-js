import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `_ref = templateLiteral` - TemplateLiteral is NOT in PLUGIN_EMIT_RHS_TYPES, so the user's
// `_ref` is treated as user code. Plugin allocates its own ref slot for the array.at
// polyfill instead of co-opting the user assignment.
import _fill from '@core-js/pure/actual/array/fill';
var _ref2;
_ref = `template-${1}`;
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);