// NEGATIVE: a nested pattern under a NON-proxy key reads a user object - the leaf is not the global
const { box: { Array: BoxArray } } = globalThis;
// NEGATIVE: a MUTATED proxy slot is the user's own replacement, so the leaf below it stays native
globalThis.self = { Array: BoxArray };
// ... and through an ALIAS of that mutated name: the binding holds the user's replacement too,
// so the leaf below it stays native exactly like the direct read
const aliasOfMutated = self;
const { Array: { from: viaAlias } } = aliasOfMutated;
export { viaAlias };
