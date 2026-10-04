// Spread getters finish constructing the receiver before the pattern writes a binding.
// The static under the final known slot remains polyfilled beside the spread.
const log = [];
const extra = { get value() { log.push(typeof from); return 7; } };
let from = 'old', value;
({ Array: { from }, value } = { ...extra, Array });
export { from, value, log };
