import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Instance defaults and caller arguments keep receiver effects ahead of property extraction.
// Nested literal slots and decided arms retain the same order.
// A receiver assignment stores its original value and evaluates it once before extraction.
export function seq(_ref = (eff(), [])) {
  let at = _at(_ref);
  return at;
}
export function slot(_ref2 = {
  C: (eff(), [])
}) {
  let toReversed = _toReversedMaybeArray(_ref2.C);
  return toReversed;
}
export const arrow = ((_ref3 = (eff(), [])) => {
  let findLast = _findLastMaybeArray(_ref3);
  return findLast;
})();
export function arm(_ref4 = (eff(), [])) {
  let flat = _flatMaybeArray(_ref4);
  return flat;
}
export function container(_ref5 = (eff(), {
  C: []
})) {
  let includes = _includes(_ref5.C);
  return includes;
}
export const argument = ((_ref6, _unused = void 0) => {
  let toSpliced = _toSplicedMaybeArray(_ref6);
  return toSpliced;
})((eff(), []));
var B;
export function store(_ref7 = B = []) {
  let toSorted = _toSortedMaybeArray(_ref7);
  return toSorted;
}
export { B };