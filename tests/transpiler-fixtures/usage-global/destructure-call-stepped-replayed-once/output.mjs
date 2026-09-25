import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.cbrt";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A call the destructure steps through runs once, where the source runs it: a keyed element read off
// the call replays it once ahead of the binding, an alias of a call ran it at its own declaration.
// A call whose callee returns ANOTHER call keeps the pure read native - not every route steps that
// chain - while the global import follows the chain to the literal.
let hits = 0;
const make = () => (hits++, [Math]);
const {
  0: {
    trunc: viaKeyed
  } = {}
} = make();
const held = make();
const [{
  sign: viaHeld
} = {}] = held;
const outer = () => make();
const [{
  cbrt: viaNested
} = {}] = outer();
export { viaKeyed, viaHeld, viaNested, hits };