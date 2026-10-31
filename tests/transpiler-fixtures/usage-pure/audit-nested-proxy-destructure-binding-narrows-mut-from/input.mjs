// NEGATIVE: a nested pattern under a NON-proxy key reads a user object - the leaf is not the global
const { box: { Array: BoxArray } } = globalThis;
// NEGATIVE: a MUTATED proxy slot is the user's own replacement, so the leaf below it stays native
globalThis.self = { Array: BoxArray };
// NEGATIVE: the mutated slot read as the ROOT BINDING - the bare name holds the user's
// replacement, so no leaf below it narrows, extracts or mirrors
const { Array: { from: mutFrom } } = self;
export { mutFrom };
