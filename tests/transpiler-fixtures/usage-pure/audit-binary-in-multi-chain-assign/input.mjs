// nested chain-assignment on the right of `in`; both inner and outer assignments
// must run even when the known-static probe folds to a constant
let a;
let b;
let c;
let d;
const r = 'from' in (a = b = Array);
const s = 'entries' in (c = d = Object);
[r, s, a, b, c, d];
