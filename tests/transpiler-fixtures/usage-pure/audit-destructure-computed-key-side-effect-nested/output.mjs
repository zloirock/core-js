import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref3;
// A nested computed static key evaluates once after its receiver is captured.
// The key precedes initialization of its source binding, and the pure method wins.
// The following instance call retains its own polyfill.
const {
    x: _ref
  } = {
    x: Array
  },
  _ref2 = _ref,
  f = null == _ref2 ? _ref2[""] : (effectful(), _Array$from);
const doubled = _flatMaybeArray(_ref3 = [1, [2]]).call(_ref3);