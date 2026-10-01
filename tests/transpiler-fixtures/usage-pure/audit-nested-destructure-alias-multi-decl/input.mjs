// A nested static and a plain sibling retain their binding names and declaration order.
const { Array: { from } } = globalThis, x = 1;
from([1]);
console.log(x);
