import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
(() => {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
// Fully-consumed nested-proxy flatten with a SE-prefix IIFE: the arrow body inside the
// SE prefix uses an instance-method polyfill that needs `var _ref;` for receiver memoize.
// scope-tracker drains those ref-bindings (otherwise applyTransforms queues an insert
// inside the parent overwrite and MagicString throws); the drained splices must be baked
// into the lifted SE-prefix source, not silently dropped, or the `_ref` reference in the
// lifted text ends up undeclared and the snippet ReferenceErrors at runtime.
const from = _Array$from;
from([]);