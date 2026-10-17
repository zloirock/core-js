import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _includes from "@core-js/pure/actual/instance/includes";
// an instance method read through a selection the build decides dispatches on its live operand, as on
// that operand spelled alone: under a container level, as a parameter default (flat and keyed), as an
// array a container slot holds, off a `||` whose left is a fresh object, and under an array pattern, at
// its top level and as an element
export const at = _atMaybeArray([]);
export function viaParam(_ref = []) {
  let flat = _flatMaybeArray(_ref);
  return flat;
}
export function viaKeyedParam(_ref2 = {
  C: []
}) {
  let includes = _includes(_ref2.C);
  return includes;
}
const {
  W: [_ref3]
} = {
  W: [[]]
};
const findLast = _findLastMaybeArray(_ref3);
export { findLast };
export const toReversed = _toReversedMaybeArray([]);
export const toSorted = _toSortedMaybeArray([]);
const [[_ref4]] = [[[]]];
const replaced = _withMaybeArray(_ref4);
export { replaced };