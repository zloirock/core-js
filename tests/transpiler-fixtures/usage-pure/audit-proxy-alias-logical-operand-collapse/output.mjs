import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// A const alias of the realm object follows the ordinary proxy-hop collapse inside
// a logical receiver. The live operand reads g.Array, so a host without native self
// does not fail before the fallback. The selected receiver is evaluated once for
// the polyfilled extraction and the remaining-key copy.
const g = _globalThis;
const {
  from,
  ...rest
} = g.Array || _Set;
from([1]);