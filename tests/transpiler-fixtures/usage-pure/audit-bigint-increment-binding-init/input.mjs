// `const x = BigInt(1); x++` - increment/decrement on a BigInt-typed binding. the
// binding-init walk follows `count` back to its `BigInt(1)` initializer and recognises
// the bigint receiver, so the post-increment value is coerced through the raw `String`
// constructor (no polyfilled `_toString` helper). only the outer `.padStart(...)` call
// against that string result is rewritten to the pad-start polyfill.
const count = BigInt(1);
const next = count++;
const repr = String(next).padStart(5, '0');
export { repr };
