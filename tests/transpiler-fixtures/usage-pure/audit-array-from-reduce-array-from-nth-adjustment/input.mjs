// `Array.from(x).reduce(Array.from)` - same callee twice; outer transform consumes
// leftmost during compose. consumedOccurrencesBefore must subtract that slot from
// rightmost inner's nth or both polyfill insertions land at the same offset
const r = Array.from(x).reduce(Array.from, init);
const s = Array.from(x).map(Array.from);
