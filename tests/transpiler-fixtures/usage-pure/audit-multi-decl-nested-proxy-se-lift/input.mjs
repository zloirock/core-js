// A static initializer sequence runs once before its binding and the following plain sibling.
let traced = 0;
function se() { traced++; return globalThis; }
const { Array: { from } } = (se(), globalThis), x = 1;
from([1, 2, 3]);
console.log(x, traced);
