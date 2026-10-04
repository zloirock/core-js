import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
var _ref2, _ref4, _ref6, _ref8, _ref10;
// Exported computed-key instance patterns retain every user binding and keep generated
// receiver captures private. Receiver reads, key effects and live defaults run in source
// order across literal and member receivers, including multiple declarators.
// The non-exported case follows the same ordering.
const _ref = [9],
  w = null == _ref ? _ref[""] : (e(), (_ref2 = _withMaybeArray(_ref)) === void 0 ? dflt() : _ref2),
  t = null == _ref ? _ref[""] : (e2(), _toSplicedMaybeArray(_ref));
export { w, t };
const _ref3 = holder.p,
  m = null == _ref3 ? _ref3[""] : (e3(), (_ref4 = _flatMaybeArray(_ref3)) === void 0 ? dflt() : _ref4),
  {
    other
  } = _ref3;
export { m, other };
const _ref5 = [7],
  a = null == _ref5 ? _ref5[""] : (e4(), (_ref6 = _atMaybeArray(_ref5)) === void 0 ? dflt() : _ref6);
console.log(w, t, m, other, a);
// Two receiver captures in one exported declaration stay distinct; only user bindings are exported.
const _ref7 = [3],
  r1 = null == _ref7 ? _ref7[""] : (e5(), (_ref8 = _toReversedMaybeArray(_ref7)) === void 0 ? dflt() : _ref8),
  {
    other2
  } = _ref7,
  _ref9 = [4],
  s1 = null == _ref9 ? _ref9[""] : (e6(), (_ref10 = _toSortedMaybeArray(_ref9)) === void 0 ? dflt() : _ref10);
export { r1, other2, s1 };
console.log(r1, s1, other2);