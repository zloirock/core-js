// chain-assignment on the right of `in`: assignment must run even when the
// known-static probe folds to a constant
let a;
let b;
const r = (a = Array, true);
const s = (b = Object, true);
[r, s, a, b];