// stacked TS wrappers inside a Paren-terminated chain: `(arr?.b! as T).c.d.includes(2)`.
// the ParenthesizedExpression SCOPES the chain - `arr?.b` short-circuits ONLY within the
// parens, then `.c.d.includes(2)` runs on the (possibly undefined) result with no outer
// null-check guard. asserts the wrapper-peel does not over-extend the chain past the Paren.
declare const arr: { b?: { c: { d: number[] } } };
(arr?.b! as { c: { d: number[] } }).c.d.includes(2);
