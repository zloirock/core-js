import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
// an instance method read through a selection the build decides dispatches on its live operand, as on
// that operand spelled alone: under a container level, as a parameter default (flat and keyed), as an
// array a container slot holds, off a `||` whose left is a fresh object, and under an array pattern, at
// its top level and as an element
export const at = _atMaybeArray([]);
export function viaParam({
  flat
} = {
  flat: _flatMaybeArray([])
}) {
  return flat;
}
export function viaKeyedParam({
  C: {
    includes
  }
} = {
  C: {
    includes: _includesMaybeArray([])
  }
}) {
  return includes;
}
const {
  W: [_ref]
} = {
  W: [[]]
};
const findLast = _findLastMaybeArray(_ref);
export { findLast };
export const toReversed = _toReversedMaybeArray([]);
export const toSorted = _toSortedMaybeArray([]);
const [[_ref2]] = [[[]]];
const replaced = _withMaybeArray(_ref2);
export { replaced };