import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _at from "@core-js/pure/actual/instance/at";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
// Parameter defaults and caller arguments evaluate their receiver once before instance extraction.
// Whole receiver defaults stay in the parameter list; inner effectful defaults keep their synth.
// Several methods share the supplied receiver without evaluating its default again.
export function viaDefault(_ref = [eff()]) {
  let at = _at(_ref);
  return at;
}
export const viaIifeArg = ((_ref2, _unused = void 0) => {
  let includes = _includesMaybeArray(_ref2);
  return includes;
})([eff(), 2]);
export function viaHopDefault(_ref3 = {
  w: [eff()]
}) {
  let findLast = _findLastMaybeArray(_ref3.w);
  return findLast;
}
export function viaInnerDefault({
  w: {
    flat
  } = {
    flat: _flatMaybeArray([eff()])
  }
}) {
  return flat;
}
export function viaTemplate(_ref4 = `${eff()}`) {
  let padEnd = _padEndMaybeString(_ref4);
  return padEnd;
}
export function viaInnerClaim(_ref5 = [_Map$groupBy(list, eff)]) {
  let fill = _fillMaybeArray(_ref5);
  return fill;
}
export function viaTwoSlots(_ref6 = [eff()]) {
  let toSorted = _toSortedMaybeArray(_ref6);
  let toReversed = _toReversedMaybeArray(_ref6);
  return [toSorted, toReversed];
}