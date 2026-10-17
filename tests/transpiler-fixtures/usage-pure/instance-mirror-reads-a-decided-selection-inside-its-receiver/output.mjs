import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Each build-decided selection dispatches on its live operand after folding its dead arm. The final
// computed selection stays open and dispatches on the runtime receiver, preserving any own `with`.
// Unknown parameter-driven family selection remains covered by `mixed-static-instance-selection`.
export function key(_ref = o['a']) {
  let at = _at(_ref);
  return at;
}
export function element(_ref2 = [1]) {
  let toReversed = _toReversedMaybeArray(_ref2);
  return toReversed;
}
export function object(_ref3 = o.arr) {
  let findLast = _findLastMaybeArray(_ref3);
  return findLast;
}
export function hop(_ref4 = {
  C: o['a']
}) {
  let flat = _flatMaybeArray(_ref4.C);
  return flat;
}
export const argument = ((_ref5, _unused = void 0) => {
  let includes = _includes(_ref5);
  return includes;
})(arr);
export function left(_ref6 = arr || other) {
  let toSorted = _toSortedMaybeArray(_ref6);
  return toSorted;
}
export function open(_ref7 = o[c ? 'a' : 'b']) {
  let replaced = _withMaybeArray(_ref7);
  return replaced;
}