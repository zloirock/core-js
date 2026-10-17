// Instance defaults and caller arguments keep receiver effects ahead of property extraction.
// Nested literal slots and decided arms retain the same order.
// A receiver assignment stores its original value and evaluates it once before extraction.
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
