// Other sources keep their rest exclusions and independently claimed statics.
// A `.self` hop in a logical's left lands on `_self` where the selection folds to that left, which the
// build serves (`.Array`, and `.Number`, a global core-js extends in place).
const { from, ...rest } = globalThis.self.Array || Set;
from([1]);
const { isInteger, ...others } = globalThis.self.Number || Set;
isInteger(1);
