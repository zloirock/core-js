import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _includes from "@core-js/pure/actual/instance/includes";
// Instance leaves under array parameter levels capture their actual supplied receiver.
// Literal caller mirrors remain available where a sibling prevents moving the whole pattern.
const viaIife = ((_ref, _unused = void 0) => {
  let [_ref2] = _ref;
  let viaIifeAt = _atMaybeArray(_ref2);
  return viaIifeAt;
})([[1, 2]]);
function viaDefault(_ref3 = [[[1], [2]]]) {
  let [_ref4] = _ref3;
  let viaDefaultFlat = _flatMaybeArray(_ref4);
  return viaDefaultFlat;
}
const viaHopThenWrap = ((_ref5, _unused2 = void 0) => {
  let {
    w: [_ref6]
  } = _ref5;
  let fl = _findLastMaybeArray(_ref6);
  return fl;
})({
  w: [[1, 2]]
});
const viaDouble = ((_ref7, _unused3 = void 0) => {
  let [[_ref8]] = _ref7;
  let tr = _toReversedMaybeArray(_ref8);
  return tr;
})([[[1, 2]]]);
const viaSibling = (([{
  toSorted: ts
}, other]) => [ts, other])([{
  toSorted: _toSortedMaybeArray([2, 1])
}, 0]);
const viaBinding = ((_ref9, _unused4 = void 0) => {
  let [_ref10] = _ref9;
  let inc = _includes(_ref10);
  return inc;
})([arr]);
const viaSelecting = ((_ref11, _unused5 = void 0) => {
  let [_ref12] = _ref11;
  let w = _withMaybeArray(_ref12);
  return w;
})([c ? [1] : [2]]);
export { viaIife, viaDefault, viaHopThenWrap, viaDouble, viaSibling, viaBinding, viaSelecting };

// An effectful element is evaluated once before its receiver is captured.
const viaEffect = ((_ref13, _unused6 = void 0) => {
  let [_ref14] = _ref13;
  let fm = _flatMapMaybeArray(_ref14);
  return fm;
})([eff()]);
export { viaEffect };