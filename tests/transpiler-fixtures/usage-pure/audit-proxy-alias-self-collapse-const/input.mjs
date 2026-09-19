// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// A const alias of the realm object follows the same proxy-hop collapse as a direct
// global reference. The retained receiver reads g.Array rather than g.self.Array,
// which also works on hosts without native self. The receiver is evaluated once
// before the polyfilled extraction and the remaining-key copy.
const g = globalThis;
const { from, ...rest } = g.self.Array;
from([1]);
