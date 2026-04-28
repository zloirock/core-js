// per-branch synth: ConditionalExpression in destructure-receiver position with TS-wrapped
// branches peels TS wrappers + `ParenthesizedExpression` before registering each branch
// as a synth target so the receiver-Identifier check sees the inner global, not the
// wrapping cast. Both branches reach apply as peeled Identifiers
const { from } = cond ? Array as any : Iterator as any;
from([1, 2]);
