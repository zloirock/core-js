import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// per-branch synth: ConditionalExpression in destructure-receiver position with TS-wrapped
// branches peels TS wrappers + `ParenthesizedExpression` before registering each branch
// as a synth target so the receiver-Identifier check sees the inner global, not the
// wrapping cast. Both branches reach apply as peeled Identifiers
const {
  from
} = cond ? {
  from: _Array$from
} as any : {
  from: _Iterator$from
} as any;
from([1, 2]);