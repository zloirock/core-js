import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref3;
// Adjacent computed static keys retain key1, binding1, key2, binding2 order.
// Both effects run once and both bindings receive their selected pure statics.
const _ref = Array,
  f = null == _ref ? _ref[""] : (eff1(), _Array$from),
  _ref2 = _ref,
  g = null == _ref2 ? _ref2[""] : (eff2(), _Array$of);
const doubled = _flatMaybeArray(_ref3 = [1, [2]]).call(_ref3);