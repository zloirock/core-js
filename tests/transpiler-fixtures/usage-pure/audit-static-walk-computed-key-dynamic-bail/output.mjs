import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// An unknown computed key cannot prove which nested slot contains Array.
// A runtime identity check supplies Array.from only for an actual Array receiver.
// Missing and custom slots keep their native behavior.
declare const fn: () => string;
const wrapper = {
  [fn()]: Array
};
const {
    a: _ref
  } = wrapper,
  from = _ref === Array ? _Array$from : _ref.from;
from;
_atMaybeArray(_ref2 = [1]).call(_ref2, 0);