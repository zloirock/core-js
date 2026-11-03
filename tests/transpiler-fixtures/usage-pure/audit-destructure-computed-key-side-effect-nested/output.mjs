import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const {
    x: {}
  } = {
    x: Array
  },
  f = (effectful(), _Array$from);
const doubled = _flatMaybeArray(_ref = [1, [2]]).call(_ref);