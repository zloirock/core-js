// mutual const aliases: `const A = B; const B = A` - alias resolution must
// detect the cycle and bail rather than recursing to a stack overflow
const A = B;
const B = A;
A.prototype.someMethod;
B.prototype.anotherMethod;
