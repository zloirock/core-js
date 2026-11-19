// The local zero is a decided falsy left operand, so the global fallback supplies Array.from directly.
// Undecided member, call and identifier left operands remain covered by
// `destructure-nested-logical-fallback-non-identifier-left`.
const m = 0;
const { Array: { from } } = m || globalThis;
from([1, 2]);
