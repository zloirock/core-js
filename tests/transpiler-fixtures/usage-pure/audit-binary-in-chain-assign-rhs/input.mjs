// chain-assignment on the right of `in`: assignment must run even when the
// known-static probe folds to a constant
let a;
let b;
const r = 'from' in (a = Array);
const s = 'entries' in (b = Object);
[r, s, a, b];
