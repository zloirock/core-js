// `const x = BigInt(1); x++` - UpdateExpression on a BigInt-typed binding. without a
// binding-init walk, `x` alone would type as `number` default and `.toString()` would
// pick the number variant polyfill; following the init to `BigInt(1)` recognizes bigint
// and chains through `_toString(x++).padStart(...)` with the correct receiver
const count = BigInt(1);
const next = count++;
const repr = String(next).padStart(5, '0');
export { repr };
