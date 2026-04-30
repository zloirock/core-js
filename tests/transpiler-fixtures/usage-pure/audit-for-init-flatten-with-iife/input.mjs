// for-init flatten + sibling IIFE with block-body arrow needing var _ref insert. asserts
// the insert-inside-overwrite collision behavior in for-init context where renderFlattened
// produces a single comma-list statement instead of multi-line splits
let result = 0;
for (let { Array: { from } } = globalThis, kls = (() => { return [].values(); })(); result < 1; result++) {
  result = from([1]).length;
}
export { result };
