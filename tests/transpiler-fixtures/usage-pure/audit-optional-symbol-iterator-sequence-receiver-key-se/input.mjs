// OPTIONAL get-iterator on a comma-sequence receiver whose computed Symbol.iterator key also
// carries a side-effect prefix. the receiver-SE runs inside the null-guard memoize (`_ref =
// recv`); the key-SE must fold into the guard's alternate so it runs only when the receiver is
// non-nullish (native short-circuits the key eval on a nullish receiver). `r()` then `k()`.
let recv = [1, 2, 3];
const it = (r(), recv)?.[Symbol[(k(), 'iterator')]]();
