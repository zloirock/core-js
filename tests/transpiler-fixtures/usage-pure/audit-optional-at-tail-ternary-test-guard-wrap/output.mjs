import _at from "@core-js/pure/actual/instance/at";
// a ternary test ends in an optional tail AFTER a non-optional middle member (`a?.at(-1).x?.y`):
// the optional .at call must be guard-wrapped and the whole short-circuit chain parenthesized so
// the `? :` reads the chain result, not a fused member
function f(a) {
  return (a == null ? void 0 : _at(a).call(a, -1).x)?.y ? 1 : 2;
}