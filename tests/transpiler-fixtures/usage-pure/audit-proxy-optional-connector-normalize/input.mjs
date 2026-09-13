// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// Optional connectors over a backed realm root are redundant. The proxy run
// globalThis?.self?.Array lands on _self.Array, and that receiver is evaluated once
// before the polyfilled extraction and the remaining-key copy.
const { from, ...rest } = globalThis?.self?.Array;
from([1]);
