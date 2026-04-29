// per-branch synth: ternary in destructure-receiver position with TS-wrapped branches
// peels TS wrappers + paren wrappers before registering each branch as a synth target
// so the receiver-identifier check sees the inner global, not the wrapping cast. Both
// branches reach apply as peeled identifiers
const { from } = cond ? Array as any : Iterator as any;
from([1, 2]);
