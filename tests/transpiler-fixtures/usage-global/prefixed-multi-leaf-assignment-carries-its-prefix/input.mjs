// A prefixed multi-leaf assignment carries its prefix into the one read it performs.
function g() { log(); return [1, [2]]; }
let s7, f7;
({ M: { findLast: s7, flat: f7 } } = (n++, { M: g() }));
use(s7, f7);
