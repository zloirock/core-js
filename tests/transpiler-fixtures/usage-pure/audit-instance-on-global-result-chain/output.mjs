import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$from from "@core-js/pure/actual/array/from";
var _ref;
// instance call chained directly on a polyfilled-global call result: both the global
// call and the instance call get their own pure-mode polyfill aliases.
_atMaybeArray(_ref = _Array$from(x)).call(_ref, 0);