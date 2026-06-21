import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
(() => {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
// Fully-consumed nested-proxy flatten with a SE-prefix IIFE: the arrow body inside the SE
// prefix uses an instance-method polyfill needing `var _ref;` for receiver memoize, and that
// binding must live inside the lifted SE slice. If dropped, the lifted snippet references an
// undeclared `_ref` (ReferenceError); if queued at the original offset, the insert lands inside
// the parent overwrite and the bundler aborts.
const from = _Array$from;
from([]);