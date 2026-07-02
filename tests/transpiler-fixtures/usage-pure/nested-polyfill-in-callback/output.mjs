import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
_filterMaybeArray(_ref = ['hello world', 'foo bar']).call(_ref, s => _includes(s).call(s, 'o'));