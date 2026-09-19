import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref2;
// A computed static key captures Array before evaluating effectful(), then binds the always-defined
// pure Array.from value. The effect runs once before the following flat expression.
const _ref = Array,
  f = null == _ref ? _ref[""] : (effectful(), _Array$from);
const doubled = _flatMaybeArray(_ref2 = [1, [2]]).call(_ref2);