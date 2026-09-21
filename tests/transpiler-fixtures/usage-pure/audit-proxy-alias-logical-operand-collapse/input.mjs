// A const alias of the realm object follows the ordinary proxy-hop collapse inside
// a logical receiver. The live operand reads g.Array, so a host without native self
// does not fail before the fallback. The selected receiver is evaluated once for
// the polyfilled extraction and the remaining-key copy.
const g = globalThis;
const { from, ...rest } = g.self.Array || Set;
from([1]);
