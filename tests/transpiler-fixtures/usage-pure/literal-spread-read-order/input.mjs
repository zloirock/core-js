// Spreading a literal source runs its getter before any destructuring assignment.
// The static wrapper read stays native and the getter observes the old binding value.
const log = [];
const extra = { get value() { log.push(typeof from); return 7; } };
let from = 'old', value;
({ Array: { from }, value } = { ...extra, Array });
export { from, value, log };
