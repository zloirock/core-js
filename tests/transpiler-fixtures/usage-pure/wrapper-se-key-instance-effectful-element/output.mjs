import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref, _ref2, _ref3;
// Capture each element once, then evaluate its computed key before the method read.
// The sibling binding keeps its position after that read.
const log = [];
function mark(tag, value) {
  _pushMaybeArray(log).call(log, tag);
  return value;
}
let viaMulti, tail, viaSole;
[_ref, _ref2] = [mark('r', Array.prototype), 7], null == _ref ? _ref[""] : (mark('k'), viaMulti = _atMaybeArray(_ref)), tail = _ref2;
[_ref3] = [mark('e', Array.prototype)], null == _ref3 ? _ref3[""] : (mark('s'), viaSole = _flatMaybeArray(_ref3));
export { viaMulti, tail, viaSole, log };