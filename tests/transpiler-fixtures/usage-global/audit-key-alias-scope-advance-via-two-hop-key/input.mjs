// a computed-key ALIAS resolves in its own declaration scope, hop by hop: a use-site shadow
// of an init name must not swallow the module-level value the alias actually holds, and an
// alias of the shadow itself must stay unresolved
const j = 'from';
const k = j;
// a TWO-HOP key alias follows transitively through both declaration scopes
const l = k;
export const viaTwoHopKey = Array[l]?.([3]);
