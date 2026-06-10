// a chain assignment with a pure fallback RHS: the assignment is rescued WHOLE (the binding
// keeps the native value, the fallback short-circuits natively) and the declarator flattens
// to the polyfill binding
let w;
const { Array: { from } } = w = globalThis || self;
from([1]);
