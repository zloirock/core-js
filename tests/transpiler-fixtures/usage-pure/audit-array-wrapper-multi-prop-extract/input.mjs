// Multiple extractable methods in the inner ObjectPattern. Each property emits its own
// flat const extraction. distinct methods (from / of) prove per-prop classification
// through the same array-wrapper chain
const [{ from, of }] = [Array];
from([1, 2]);
of(3, 4);
