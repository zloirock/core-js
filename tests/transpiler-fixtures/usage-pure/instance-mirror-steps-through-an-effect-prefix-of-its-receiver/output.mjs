import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
// an instance method a parameter default or an IIFE argument mirrors reads its receiver through a sequence,
// the prefix left to run where the source wrote it, as that receiver spelled alone: the default itself, a
// hop slot, an arrow's default, a decided arm, a decided container and an argument's decided arm. a store
// is no prefix: a mirror would write through it, so that default stays as written
export function seq({
  at
} = (eff(), {
  at: _atMaybeArray([])
})) {
  return at;
}
export function slot({
  C: {
    toReversed
  }
} = {
  C: (eff(), {
    toReversed: _toReversedMaybeArray([])
  })
}) {
  return toReversed;
}
export const arrow = (({
  findLast
} = (eff(), {
  findLast: _findLastMaybeArray([])
})) => findLast)();
export function arm({
  flat
} = (eff(), {
  flat: _flatMaybeArray([])
})) {
  return flat;
}
export function container({
  C: {
    includes
  }
} = (eff(), {
  C: {
    includes: _includesMaybeArray([])
  }
})) {
  return includes;
}
export const argument = (({
  toSpliced
}) => toSpliced)((eff(), {
  toSpliced: _toSplicedMaybeArray([])
}));
var B;
export function store({
  toSorted
} = B = []) {
  return toSorted;
}
export { B };