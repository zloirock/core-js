// the `?.` deopt asks the CANON which global its receiver names, never the raw spelling: a bound
// alias of a global is the same always-defined static as the direct form, so the guard dies with the
// substitution. classifying by name - bound means "not a global" - kept a guard over the polyfill the
// same pass had just substituted under it. the negatives keep it: a reassigned alias narrows only
// under a ctor identity test, and a local object is no global at all
const A = Array;
export const aliasStatic = A.from?.([1]).at(-1);
export const directStatic = Array.from?.([2]).at(-1);

let R = Array;
R = Object;
export const reassigned = R.from?.([3]).at(-1);

const local = { from: xs => xs };
export const localObject = local.from?.([4]);
