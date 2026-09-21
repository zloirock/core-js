// Optional connectors over a backed realm root are redundant. The proxy run
// globalThis?.self?.Array lands on _self.Array, and that receiver is evaluated once
// before the polyfilled extraction and the remaining-key copy.
const { from, ...rest } = globalThis?.self?.Array;
from([1]);
