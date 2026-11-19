// Instance defaults guard the extracted method and preserve array siblings.
// The static-only Array.of wrapper keeps its native read and default.
let o;
[{ of: o = fb }] = [Array];
use(o);
let m;
[{ at: m = fb }] = [arr];
use(m);
let k, other;
[{ findIndex: k = fb }, other] = [arr, 1];
use(k, other);
