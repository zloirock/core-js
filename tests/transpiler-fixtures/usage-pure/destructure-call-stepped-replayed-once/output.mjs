import _Math$trunc from "@core-js/pure/actual/math/trunc";
// The existing keyed call fallback replays the call once before extraction.
// Held and positional array wrappers keep their native static reads.
let hits = 0;
const make = () => (hits++, [Math]);
make();
const viaKeyed = _Math$trunc;
const held = make();
const [{
  sign: viaHeld
} = {}] = held;
const outer = () => make();
const [{
  cbrt: viaNested
} = {}] = outer();
export { viaKeyed, viaHeld, viaNested, hits };