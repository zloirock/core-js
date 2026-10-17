import iterSym from "s";
// a call through a DYNAMIC (symbol / unresolved) key may be any mutator - it bails
const keyed = [[1], [2]];
keyed[iterSym]();
export const viaDynamicKeyCall = keyed[0].at(4);
