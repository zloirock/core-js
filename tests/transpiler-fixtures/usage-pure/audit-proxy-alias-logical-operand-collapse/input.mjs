// A const alias of the realm object follows the ordinary proxy-hop collapse inside
// a logical receiver: a left the build serves (`g.self.Array`, and `g.self.Number`, a global
// core-js extends in place) folds it, read as `g.Array` so a host without native self does not
// fail. The selected receiver is evaluated once for the polyfilled extraction and the remaining-key copy.
const g = globalThis;
const { from, ...rest } = g.self.Array || Set;
from([1]);
const { isInteger, ...others } = g.self.Number || Set;
isInteger(1);
