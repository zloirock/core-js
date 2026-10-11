// an instance method a parameter default or an IIFE argument mirrors reads its receiver through a sequence,
// the prefix left to run where the source wrote it, as that receiver spelled alone: the default itself, a
// hop slot, an arrow's default, a decided arm, a decided container and an argument's decided arm. a store
// is no prefix: a mirror would write through it, so that default stays as written
export function seq({ at } = (eff(), [])) {
  return at;
}
export function slot({ C: { toReversed } } = { C: (eff(), []) }) {
  return toReversed;
}
export const arrow = (({ findLast } = (eff(), [])) => findLast)();
export function arm({ flat } = typeof Symbol != 'undefined' ? (eff(), []) : u) {
  return flat;
}
export function container({ C: { includes } } = typeof Symbol != 'undefined' && (eff(), { C: [] })) {
  return includes;
}
export const argument = (({ toSpliced }) => toSpliced)(typeof Symbol != 'undefined' ? (eff(), []) : u);
var B;
export function store({ toSorted } = (B = [])) {
  return toSorted;
}
export { B };
