import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref2;
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const {
    a: {
      b: _ref
    }
  } = {
    a: {
      b: Array
    }
  },
  f = (effectful(), _Array$from);
const probe = _includesMaybeArray(_ref2 = [1, 2]).call(_ref2, 2);