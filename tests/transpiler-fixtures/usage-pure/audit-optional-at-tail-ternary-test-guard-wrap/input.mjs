// a ternary test ends in an optional tail AFTER a non-optional middle member (`a?.at(-1).x?.y`):
// the optional .at call must be guard-wrapped and the whole short-circuit chain parenthesized so
// the `? :` reads the chain result, not a fused member
function f(a) { return a?.at(-1).x?.y ? 1 : 2; }
