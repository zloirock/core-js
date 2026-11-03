import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const arr = [1, [2]];
const _ref = {
    x: Array,
    y: arr
  },
  {
    x: {}
  } = _ref,
  f = (before(), _Array$from),
  {
    y: _ref2
  } = _ref,
  m = null == _ref2 ? _ref2[""] : (after(), _flatMaybeArray(_ref2));