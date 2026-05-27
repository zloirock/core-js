import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref;
// `const x = BigInt(1); x++` - increment/decrement on a BigInt-typed binding. the
// binding-init walk follows `count` back to its `BigInt(1)` initializer and recognises
// the bigint receiver, so the post-increment value is coerced through the raw `String`
// constructor (no polyfilled `_toString` helper). only the outer `.padStart(...)` call
// against that string result is rewritten to the pad-start polyfill.
const count = BigInt(1);
const next = count++;
const repr = _padStartMaybeString(_ref = String(next)).call(_ref, 5, '0');
export { repr };