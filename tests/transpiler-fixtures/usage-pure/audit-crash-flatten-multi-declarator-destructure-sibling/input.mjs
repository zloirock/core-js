// a multi-declarator VariableDeclaration mixing a proxy-global flatten declarator with an
// instance-method destructuring sibling (`{ at } = getArr()`). the flatten owns the whole-
// declaration rewrite, so the sibling can't emit its own (equal-range merge crash); the flatten
// renders the sibling's polyfill inline instead, so `at` is preserved (`at = _at(getArr())`) and
// both plugins agree. regression lock
const { at } = getArr(), { Array: { from } } = globalThis;
at;
from([1]);
