// A flatten declarator shares its declaration with a sibling extracting a Symbol.iterator method.
// the bailed sibling reuses the full byStatement emit, so the iterator helper survives instead of
// rendering the pattern verbatim
const { Array: { from } } = globalThis, { [Symbol.iterator]: it } = obj;
from([1]);
console.log(it);
