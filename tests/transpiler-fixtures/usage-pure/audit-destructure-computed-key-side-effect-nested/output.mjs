import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref2;
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const {
    x: _ref
  } = {
    x: Array
  },
  f = (effectful(), _Array$from);
const doubled = _flatMaybeArray(_ref2 = [1, [2]]).call(_ref2);