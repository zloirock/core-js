var _ref;
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _includes from "@core-js/pure/actual/instance/includes";
_filterMaybeArray(_ref = ['hello world', 'foo bar']).call(_ref, s => _includes(s).call(s, 'o'));