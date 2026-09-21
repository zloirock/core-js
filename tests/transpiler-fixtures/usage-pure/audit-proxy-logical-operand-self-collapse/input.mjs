// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
const { from, ...rest } = globalThis.self.Array || Set;
from([1]);
