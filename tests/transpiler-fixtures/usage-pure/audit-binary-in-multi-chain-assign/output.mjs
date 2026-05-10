// nested chain-assignment on the right of `in`; both inner and outer assignments
// must run even when the known-static probe folds to a constant
let a;
let b;
let c;
let d;
const r = (a = b = Array, true);
const s = (c = d = Object, true);
[r, s, a, b, c, d];