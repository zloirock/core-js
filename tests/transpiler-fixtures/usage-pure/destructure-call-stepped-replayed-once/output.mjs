import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// A call the destructure steps through runs once, where the source runs it: a keyed element read off
// the call replays it once ahead of the binding, an alias of a call ran it at its own declaration.
// A call whose callee returns ANOTHER call keeps the pure read native - not every route steps that
// chain - while the global import follows the chain to the literal.
let hits = 0;
const make = () => (hits++, [Math]);
make();
const viaKeyed = _Math$trunc;
const held = make();
const viaHeld = _Math$sign;
const outer = () => make();
const [{
  cbrt: viaNested
} = {}] = outer();
export { viaKeyed, viaHeld, viaNested, hits };