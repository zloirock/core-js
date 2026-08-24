// the DEFAULTED slot matrix under an array-wrapped ASSIGNMENT host: a STATIC claim's
// default is DEAD (the pairing proved the element) and the consume drops the raw
// destructure with it - babel's spelling and the declaration route's own rule - while an
// INSTANCE claim keeps the raw destructure (the native default assigns first) and the
// overwrite re-binds after
let o;
[{ of: o = fb }] = [Array];
use(o);
let m;
[{ at: m = fb }] = [arr];
use(m);
