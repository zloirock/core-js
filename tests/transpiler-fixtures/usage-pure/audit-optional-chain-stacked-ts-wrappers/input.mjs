// stacked TS wrappers inside Paren-terminated chain: `(arr?.b! as T).c.d.includes(2)`.
// the ParenthesizedExpression SCOPES the optional chain - native `arr?.b` short-circuits
// ONLY within the parens, then `.c.d.includes(2)` runs on the (possibly undefined) result.
// babel correctly emits without an outer null-check guard since the chain semantics end
// at the Paren boundary; if arr is null `arr?.b` returns undefined and `.c` throws
// TypeError - matching native. asserts the wrapper-peel doesn't over-extend the chain
// across Paren boundaries
declare const arr: { b?: { c: { d: number[] } } };
(arr?.b! as { c: { d: number[] } }).c.d.includes(2);
