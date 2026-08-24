import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// proxy/static flatten (`{ from } = (SE, Array)`) whose lifted SE-prefix IIFE body hosts BOTH an
// instance-method polyfill AND a nested destructure-with-default. the nested declaration must
// emit before its container so the container drains its scoped ref - the reverse
// order once produced overlapping rewrites. regression lock
const o = [1];
(() => {
  var _ref, _ref2;
  _atMaybeArray(_ref = [1]).call(_ref, 0);
  const at = (_ref2 = _atMaybeArray(o)) === void 0 ? () => 0 : _ref2;
  return Array;
})();
const from = _Array$from;
from([1]);