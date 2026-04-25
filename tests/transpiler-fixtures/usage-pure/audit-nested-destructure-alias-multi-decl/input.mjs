// multi-declarator `const { Array: { from } } = globalThis, x = 1`. nested-proxy flatten
// extracts only the polyfill-able declarator (`from = _Array$from`), hoisting it ahead of
// the remaining declarations so the sibling `x = 1` stays in its original slot, preserving
// source order and declaration semantics
const { Array: { from } } = globalThis, x = 1;
from([1]);
console.log(x);
