import _at from "@core-js/pure/actual/instance/at";
import iterSym from "s";
// a call through a DYNAMIC (symbol / unresolved) key may be any mutator - it bails
var _ref;
const keyed = [[1], [2]];
keyed[iterSym]();
export const viaDynamicKeyCall = _at(_ref = keyed[0]).call(_ref, 4);