// `_ref = templateLiteral` - TemplateLiteral is NOT in PLUGIN_EMIT_RHS_TYPES, so the user's
// `_ref` is treated as user code. Plugin allocates its own ref slot for the array.at
// polyfill instead of co-opting the user assignment.
import _fill from '@core-js/pure/actual/array/fill';
_ref = `template-${1}`;
[1, 2, 3].at(0);
