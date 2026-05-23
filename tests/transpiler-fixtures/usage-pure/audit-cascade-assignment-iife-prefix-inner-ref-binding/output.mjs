import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// AssignmentExpression cascade host with an IIFE-bodied SE prefix containing an inner
// instance-method polyfill. `[1].at(0)` registers a `var _ref;` ref-binding inside the
// IIFE body DURING traversal; pre-fix the cascade emitted its statement-range overwrite
// immediately and the later ref-insert tripped `transform-queue: insert at N lands inside
// overwrite`. now `pendingCascade` defers the overwrite to flush time, drains the
// ref-bindings in the statement range, and bakes them into the per-prefix nodeSrc
let from;
(function () {
  var _ref;
  return _atMaybeArray(_ref = [1]).call(_ref, 0);
})();
from = _Array$from;
from([2, 3]);