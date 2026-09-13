import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
var _ref3, _ref7, _ref9, _ref12, _ref14;
// Exported computed-key instance patterns retain every user binding and keep generated
// receiver captures private. Receiver reads, key effects and live defaults run in source
// order across literal and member receivers, including multiple declarators.
// The non-exported case follows the same ordering.
const _ref = [9],
  _ref2 = _ref,
  w = null == _ref2 ? _ref2[""] : (e(), (_ref3 = _withMaybeArray(_ref2)) === void 0 ? dflt() : _ref3),
  _ref4 = _ref,
  t = null == _ref4 ? _ref4[""] : (e2(), _toSplicedMaybeArray(_ref4));
export { w, t };
const _ref5 = holder.p,
  _ref6 = _ref5,
  m = null == _ref6 ? _ref6[""] : (e3(), (_ref7 = _flatMaybeArray(_ref6)) === void 0 ? dflt() : _ref7),
  {
    other
  } = _ref5;
export { m, other };
const _ref8 = [7],
  a = null == _ref8 ? _ref8[""] : (e4(), (_ref9 = _atMaybeArray(_ref8)) === void 0 ? dflt() : _ref9);
console.log(w, t, m, other, a);
// Two receiver captures in one exported declaration stay distinct; only user bindings are exported.
const _ref10 = [3],
  _ref11 = _ref10,
  r1 = null == _ref11 ? _ref11[""] : (e5(), (_ref12 = _toReversedMaybeArray(_ref11)) === void 0 ? dflt() : _ref12),
  {
    other2
  } = _ref10,
  _ref13 = [4],
  s1 = null == _ref13 ? _ref13[""] : (e6(), (_ref14 = _toSortedMaybeArray(_ref13)) === void 0 ? dflt() : _ref14);
export { r1, other2, s1 };
console.log(r1, s1, other2);