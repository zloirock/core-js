import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const arr = [1, [2]];
const _ref2 = {
    x: Array,
    y: arr
  },
  {
    x: _ref
  } = _ref2,
  f = (before(), _Array$from),
  {
    y: _ref3
  } = _ref2,
  m = null == _ref3 ? _ref3[""] : (after(), _flatMaybeArray(_ref3));