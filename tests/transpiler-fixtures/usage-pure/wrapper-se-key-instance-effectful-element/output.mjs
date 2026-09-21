import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// Capture each element once, then evaluate its computed key before the method read.
// The sibling binding keeps its position after that read.
const log = [];
function mark(tag, value) {
  _pushMaybeArray(log).call(log, tag);
  return value;
}
let viaMulti, tail, viaSole;
[_ref, _ref2] = _ref3 = [mark('r', Array.prototype), 7], _ref4 = _ref, null == _ref4 ? _ref4[""] : (mark('k'), viaMulti = _atMaybeArray(_ref4)), _ref4, tail = _ref2, _ref3;
[_ref5] = _ref6 = [mark('e', Array.prototype)], _ref7 = _ref5, null == _ref7 ? _ref7[""] : (mark('s'), viaSole = _flatMaybeArray(_ref7)), _ref7, _ref6;
export { viaMulti, tail, viaSole, log };