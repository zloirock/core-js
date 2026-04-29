// cyclic const chain through member-access inits - must not crash with stack overflow
const a = b.x;
const b = a.x;
a.from;
