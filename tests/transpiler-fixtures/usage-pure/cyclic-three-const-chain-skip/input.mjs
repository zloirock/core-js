// cyclic const chain through 3 identifiers — must not crash with stack overflow
const a = b;
const b = c;
const c = a;
a.from;
