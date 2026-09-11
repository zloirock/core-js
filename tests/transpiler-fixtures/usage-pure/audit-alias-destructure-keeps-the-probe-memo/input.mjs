// one receiver, one spelling: the probe memo the claim channel builds does not depend on how the
// ROOT is written. read plainly off an alias it memoizes, and the destructuring read of the same
// navigation owes the same memo - collapsing the alias spelling to the ponyfill instead answered
// off a different object than the bare twin one line down
const ga = globalThis;
export const { trunc: aliased } = ga.window?.self.Array.prototype.at.Math;
export const { trunc: bare } = globalThis.window?.self.Array.prototype.at.Math;
export const read = ga.window?.self.Array.prototype.at;
