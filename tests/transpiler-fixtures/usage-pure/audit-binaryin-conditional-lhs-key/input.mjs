// `(cond ? 'a' : 'b') in obj` - LHS is a conditional expression resolving to a string.
// resolveKey cannot fold a ConditionalExpression to a single static key, so the in-check
// is left raw. unrelated `Array.from` and `Set.intersection` polyfill via second/third
// statements anchor the imports.
const r1 = (cond ? 'from' : 'flat') in obj;
const r2 = Array.from(src);
const r3 = new Set([1]).intersection(other);
export { r1, r2, r3 };
