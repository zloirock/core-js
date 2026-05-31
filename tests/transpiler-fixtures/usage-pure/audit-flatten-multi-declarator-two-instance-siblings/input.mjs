// proxy-global flatten declarator sharing a VariableDeclaration with TWO instance-method
// destructuring siblings (`{ at } = getArr()`, `{ flat } = getArr2()`). the flatten owns the
// whole-declaration rewrite and renders each sibling's polyfill inline, so neither `at` nor
// `flat` is lost. distinct from the single-sibling case: exercises rewriting multiple sibling
// slots. regression lock
const { at } = getArr(), { flat } = getArr2(), { Array: { from } } = globalThis;
at;
flat;
from([1]);
