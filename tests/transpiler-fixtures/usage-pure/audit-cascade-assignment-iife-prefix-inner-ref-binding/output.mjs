import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// AssignmentExpression cascade host with an IIFE-bodied side-effect prefix containing an inner
// instance-method polyfill. `[1].at(0)` needs a `var _ref;` inside the IIFE body, registered
// while the cascade rewrite is still pending. if the cascade overwrite lands before that ref
// binding is baked into the lifted slice, `_ref` ends up undeclared and overlapping edits throw
let from;
(function () {
  var _ref;
  return _atMaybeArray(_ref = [1]).call(_ref, 0);
})();
from = _Array$from;
from([2, 3]);