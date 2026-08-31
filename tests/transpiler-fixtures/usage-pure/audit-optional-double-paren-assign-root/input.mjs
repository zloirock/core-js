// DOUBLE-paren-wrapped assignment as the root of an optional proxy chain. the store holds a defined
// realm alias, so the guard erases and the assignment rides the collapsed receiver - where the reprint
// must spell it BARE (`n = gw`), never with a leftover paren: a paren nest bottoming out at a plain
// expression peels FULLY. the single-paren line is the control the doubled ones have to match.
// a `.name` tail keeps the read receiver-independent; distinct ctor + method per line
let n, s, w;
const gw = globalThis;
export const doubleMapHas = ((n = gw))?.self.Map.prototype.has.name;
export const doubleSetAdd = ((s = gw))?.self.window.Set.prototype.add.name;
export const singleWeakGet = (w = gw)?.self.WeakMap.prototype.get.name;
