import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Two computed instance keys keep their effects at the native property reads.
// The outer key and array iteration select the receiver once for both leaves.
const {
    w: _ref
  } = {
    w: [[1, [2]]]
  },
  [_ref2] = _ref,
  at = null == _ref2 ? _ref2[""] : (effect(), _atMaybeArray(_ref2)),
  flat = (effect(), _flatMaybeArray(_ref2));
use(at, flat);