import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Multiple extractable methods in the inner ObjectPattern. Each property emits its own
// flat const extraction. distinct methods (from / of) prove per-prop classification
// through the same array-wrapper chain
const from = _Array$from;
const of = _Array$of;
from([1, 2]);
of(3, 4);