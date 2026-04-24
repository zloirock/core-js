// cyclic const chain through MemberExpression inits - must not crash with stack overflow
const a = b.x;
const b = a.x;
a.from;