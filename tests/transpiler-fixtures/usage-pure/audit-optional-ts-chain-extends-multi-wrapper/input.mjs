// Chain extending through TS wrappers without any source paren: optional chain spans
// `?.at(-1)` polyfillable + TS `!`/`as`/`satisfies` + continued regular member access
// inside the SAME ChainExpression. `sharesChainExpression(metaPath, outer)` returns true
// for these shapes, so `guardNeedsParens` skips wrapping the ternary; the polyfill
// emits as raw `arr == null ? void 0 : ...<tail>` and short-circuit semantics survive
// (arr null -> entire chain resolves to undefined, no further methods invoked).
// distinct continuation tails per slot:
//   `!.toString()`  - TSNonNullExpression then regular member call
//   `as any .padEnd` - TSAsExpression then regular member call (no outer paren, chain
//                     extends)
//   `!.length`      - TSNonNullExpression then property access (no call)
declare const arr: number[];
const a = arr?.at(-1)!.toString();
const b = arr?.at(-1) as any;
const c = arr?.at(-1)!.toFixed?.(2);
export { a, b, c };
