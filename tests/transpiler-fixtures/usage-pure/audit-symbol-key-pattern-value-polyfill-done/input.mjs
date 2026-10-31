// prop-level default: the helper result is guarded (a memoized `=== void 0` test), so a genuinely
// non-iterable receiver still takes the user default like a raw undefined read would
const fb = { done: true };
const nonIterable = {};
const { [Symbol.iterator]: { done } = fb } = nonIterable;
export { done };
