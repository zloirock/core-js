import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
// an instance claim destructured off a parameter default or an IIFE argument that is a literal running
// code (`[eff()]`) is served by the one slot's instance synth like its effect-free twin: the slot spells
// the literal in place, so it runs once, where the default fires, and claims inside it stay live. two
// slots would spell it twice, so they keep the native read, as two slots of an invocation do
export function viaDefault({
  at
} = {
  at: _atMaybeArray([eff()])
}) {
  return at;
}
export const viaIifeArg = (({
  includes
}) => includes)({
  includes: _includesMaybeArray([eff(), 2])
});
export function viaHopDefault({
  w: {
    findLast
  }
} = {
  w: {
    findLast: _findLastMaybeArray([eff()])
  }
}) {
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
export function viaTemplate({
  padEnd
} = {
  padEnd: _padEndMaybeString(`${eff()}`)
}) {
  return padEnd;
}
export function viaInnerClaim({
  fill
} = {
  fill: _fillMaybeArray([_Map$groupBy(list, eff)])
}) {
  return fill;
}
export function twoSlotsStayNative({
  toSorted,
  toReversed
} = [eff()]) {
  return [toSorted, toReversed];
}