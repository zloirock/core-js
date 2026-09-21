import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
var _ref2, _ref5, _ref7, _ref9, _ref11;
// Exported computed-key instance patterns retain every user binding and keep generated
// receiver captures private. Receiver reads, key effects and live defaults run in source
// order across literal and member receivers, including multiple declarators.
// The non-exported case follows the same ordering.
const _ref = [9],
  w = null == _ref ? _ref[""] : (e(), (_ref2 = _withMaybeArray(_ref)) === void 0 ? dflt() : _ref2),
  _ref3 = _ref,
  t = null == _ref3 ? _ref3[""] : (e2(), _toSplicedMaybeArray(_ref3));
export { w, t };
const _ref4 = holder.p,
  m = null == _ref4 ? _ref4[""] : (e3(), (_ref5 = _flatMaybeArray(_ref4)) === void 0 ? dflt() : _ref5),
  {
    other
  } = _ref4;
export { m, other };
const _ref6 = [7],
  a = null == _ref6 ? _ref6[""] : (e4(), (_ref7 = _atMaybeArray(_ref6)) === void 0 ? dflt() : _ref7);
console.log(w, t, m, other, a);
// Two receiver captures in one exported declaration stay distinct; only user bindings are exported.
const _ref8 = [3],
  r1 = null == _ref8 ? _ref8[""] : (e5(), (_ref9 = _toReversedMaybeArray(_ref8)) === void 0 ? dflt() : _ref9),
  {
    other2
  } = _ref8,
  _ref10 = [4],
  s1 = null == _ref10 ? _ref10[""] : (e6(), (_ref11 = _toSortedMaybeArray(_ref10)) === void 0 ? dflt() : _ref11);
export { r1, other2, s1 };
console.log(r1, s1, other2);