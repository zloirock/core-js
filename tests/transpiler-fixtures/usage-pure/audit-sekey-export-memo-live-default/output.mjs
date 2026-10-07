import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
var _ref, _ref4, _ref5, _ref7, _ref9;
// Exported computed-key instance patterns retain every user binding and keep generated
// receiver captures private. Receiver reads, key effects and live defaults run in source
// order across literal and member receivers, including multiple declarators.
// The non-exported case follows the same ordering.
const _ref2 = [9],
  w = (e(), (_ref = _withMaybeArray(_ref2)) === void 0 ? dflt() : _ref),
  t = (e2(), _toSplicedMaybeArray(_ref2));
export { w, t };
const _ref3 = holder.p,
  m = null == _ref3 ? _ref3[""] : (e3(), (_ref4 = _flatMaybeArray(_ref3)) === void 0 ? dflt() : _ref4),
  {
    other
  } = _ref3;
export { m, other };
const _ref6 = [7],
  a = (e4(), (_ref5 = _atMaybeArray(_ref6)) === void 0 ? dflt() : _ref5);
console.log(w, t, m, other, a);
// Two receiver captures in one exported declaration stay distinct; only user bindings are exported.
const _ref8 = [3],
  r1 = (e5(), (_ref7 = _toReversedMaybeArray(_ref8)) === void 0 ? dflt() : _ref7),
  {
    other2
  } = _ref8,
  _ref10 = [4],
  s1 = (e6(), (_ref9 = _toSortedMaybeArray(_ref10)) === void 0 ? dflt() : _ref9);
export { r1, other2, s1 };
console.log(r1, s1, other2);