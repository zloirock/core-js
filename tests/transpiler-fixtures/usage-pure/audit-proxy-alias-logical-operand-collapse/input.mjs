// A const-alias proxy root with a `.self` hop in a LOGICAL operand must collapse the hop in the live
// operand (`g.self.Array` -> `g.Array`), like a bare receiver, so the evaluated operand never reads
// `g.self` (undefined on ie:11 / Node, throws before `||` short-circuits). Both emitters collapse.
const g = globalThis;
const { from, ...rest } = g.self.Array || Set;
from([1]);
