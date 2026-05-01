import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `_ref = bareIdentifier` - RHS is a simple Identifier; PLUGIN_EMIT_RHS_TYPES does NOT
// include Identifier so isPluginShapedOrphanAssign returns false. User's `_ref` must
// not be adopted; plugin allocates its own slot for the array.at polyfill.
import _fill from '@core-js/pure/actual/array/fill';
var _ref2;
const helper = 42;
_ref = helper;
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);