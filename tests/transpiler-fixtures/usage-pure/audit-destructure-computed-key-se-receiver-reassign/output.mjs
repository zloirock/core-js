import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref2;
// Capture the RHS receiver before the computed key reassigns its binding.
// The key effect then runs before the instance method is read from that original receiver,
// so the reassignment cannot redirect the read to a different array.
let arr = [[1], [2]];
const _ref = arr,
  m = null == _ref ? _ref[""] : (arr = [[9]], _flatMaybeArray(_ref));
const probe = _includesMaybeArray(_ref2 = [3]).call(_ref2, 3);