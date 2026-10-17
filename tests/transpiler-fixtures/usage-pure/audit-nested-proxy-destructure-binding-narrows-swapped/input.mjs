// NEGATIVE: a nested pattern under a NON-proxy key reads a user object - the leaf is not the global
const { box: { Array: BoxArray } } = globalThis;
// NEGATIVE: a MUTATED proxy slot is the user's own replacement, so the leaf below it stays native
globalThis.self = { Array: BoxArray };
const { self: { Array: SelfArray } } = globalThis;
const swapped = SelfArray.from([6]);
export { swapped };
