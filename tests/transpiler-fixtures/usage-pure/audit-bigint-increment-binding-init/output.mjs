import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref;
// `const x = BigInt(1); x++` - UpdateExpression on a BigInt-typed binding. without a
// binding-init walk, `x` alone would type as `number` default and `.toString()` would
// pick the number variant polyfill; following the init to `BigInt(1)` recognizes bigint
// and chains through `_toString(x++).padStart(...)` with the correct receiver
const count = BigInt(1);
const next = count++;
const repr = _padStartMaybeString(_ref = String(next)).call(_ref, 5, '0');
export { repr };