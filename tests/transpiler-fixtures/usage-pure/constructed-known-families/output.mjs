import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// Proven constructors keep distinct array and string dispatchers.
// Each method exposes an extra import if its receiver loses that precision.
_atMaybeArray(_ref = new Array(1, 2, 3)).call(_ref, -1);
_includesMaybeString(_ref2 = new String('abc')).call(_ref2, 'b');