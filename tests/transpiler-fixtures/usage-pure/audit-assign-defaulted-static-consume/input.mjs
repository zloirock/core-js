// Defaults on known static slots remain dead; instance slots retain their runtime guards.
// Array wrappers preserve sibling bindings and the source assignment value.
let o;
[{ of: o = fb }] = [Array];
use(o);
let m;
[{ at: m = fb }] = [arr];
use(m);
let k, other;
[{ findIndex: k = fb }, other] = [arr, 1];
use(k, other);
