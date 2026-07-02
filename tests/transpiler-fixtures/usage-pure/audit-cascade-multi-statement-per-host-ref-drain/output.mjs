import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
// two AssignmentExpression cascades back-to-back, each with its own IIFE-bodied side-effect
// prefix containing an inner instance-method polyfill. each cascade must absorb only ITS OWN
// inner refs into the lifted prefix; cross-statement bleed would emit one statement's `_ref`
// into the other's range. `.at` in the first IIFE and `.includes` in the second keep them distinct
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