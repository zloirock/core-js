// A symbol-iterator sibling keeps its helper beside the nested static claim.
const { Array: { from } } = globalThis, { [Symbol.iterator]: it } = obj;
from([1]);
console.log(it);
