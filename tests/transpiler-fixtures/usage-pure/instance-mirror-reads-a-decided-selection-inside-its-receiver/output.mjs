import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// an instance method a parameter default or an IIFE argument mirrors dispatches on its receiver with every
// selection the build decides inside it read by its live operand, as that receiver spelled without it: a
// computed key, an element, a member object, a hop slot, the argument itself and a `||` left. a selection
// the build leaves open in a computed key keeps the read native, as any unproven key does
export function key({
  at
} = {
  at: _at(o['a'])
}) {
  return at;
}
export function element({
  toReversed
} = {
  toReversed: _toReversedMaybeArray([1])
}) {
  return toReversed;
}
export function object({
  findLast
} = {
  findLast: _findLastMaybeArray(o.arr)
}) {
  return findLast;
}
export function hop({
  C: {
    flat
  }
} = {
  C: {
    flat: _flatMaybeArray(o['a'])
  }
}) {
  return flat;
}
export const argument = (({
  includes
}) => includes)({
  includes: _includes(arr)
});
export function left({
  toSorted
} = {
  toSorted: _toSortedMaybeArray(arr || other)
}) {
  return toSorted;
}
export function open({
  with: replaced
} = o[c ? 'a' : 'b']) {
  return replaced;
}