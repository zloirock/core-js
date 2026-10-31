// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
let o;
[{ of: o = fb }] = [Array];
use(o);
let m;
[{ at: m = fb }] = [arr];
use(m);
let k, other;
[{ findIndex: k = fb }, other] = [arr, 1];
use(k, other);
