// the DEFAULTED slot matrix under an array-wrapped ASSIGNMENT host: a STATIC claim's default is DEAD
// (the pairing proved the element) and the consume drops the raw destructure with it - the
// declaration route's own rule - and an INSTANCE claim drops it too once nothing reads the slot,
// its guard then spelling the default NODE. a SIBLING element keeps the destructure whole (it still
// binds), and the slot that survives is what ran the default, so there the guard takes the BINDING
let o;
[{ of: o = fb }] = [Array];
use(o);
let m;
[{ at: m = fb }] = [arr];
use(m);
let k, other;
[{ findIndex: k = fb }, other] = [arr, 1];
use(k, other);
