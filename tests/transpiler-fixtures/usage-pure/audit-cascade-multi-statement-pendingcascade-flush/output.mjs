import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
// two AssignmentExpression cascades back-to-back, each with its own IIFE-bodied SE prefix
// containing an inner instance-method polyfill. `pendingCascade` queue must accumulate
// both entries and `flushPendingCascade` must drain each statement's ref-bindings in its
// own range. uses `.at` in first cascade's IIFE and `.includes` in second to keep the
// two `_ref` declarations distinct; receiver inner polyfills differ so each statement's
// drain returns its own splice set
let from;
let of;
(function () {
  var _ref;
  return _atMaybeArray(_ref = [1]).call(_ref, 0);
})();
from = _Array$from;
(function () {
  var _ref2;
  return _includesMaybeArray(_ref2 = [2]).call(_ref2, 1);
})();
of = _Array$of;
from([3]);
of(4);