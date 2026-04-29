import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// per-branch synth: ternary in destructure-receiver position with TS-wrapped branches
// peels TS wrappers + paren wrappers before registering each branch as a synth target
// so the receiver-identifier check sees the inner global, not the wrapping cast. Both
// branches reach apply as peeled identifiers
const { from } = cond ? { from: _Array$from } : { from: _Iterator$from };
from([1, 2]);