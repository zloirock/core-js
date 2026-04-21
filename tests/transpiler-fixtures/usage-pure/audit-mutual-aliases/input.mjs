// mutual const aliases: `const A = B; const B = A`. resolveBindingToGlobal follows
// A -> B, seen.add(A), then B -> A, seen.has(A) -> return null. Prevents stack overflow
const A = B;
const B = A;
A.prototype.someMethod;
B.prototype.anotherMethod;
