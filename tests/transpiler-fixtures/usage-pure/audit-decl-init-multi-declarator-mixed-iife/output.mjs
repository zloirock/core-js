import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
(function () {
  var _ref;
  return _atMaybeArray(_ref = [1]).call(_ref, 0);
})();
// Two declarators destructure statics, the first off a sequence whose prefix calls a function with a
// polyfilled method inside, the second off the plain constructor: the prefix runs first as a statement
// of its own, the method's memo staying inside its function, and each static extracts as a
// declaration of its own.
const from = _Array$from;
const of = _Array$of;
from([2]);
of(3);