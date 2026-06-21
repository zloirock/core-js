// Chain extending through TS wrappers without any source paren: the optional chain spans
// `?.at(-1)` + TS `!`/`as` + continued member access inside the SAME ChainExpression. since the
// outer member shares that chain, the guard ternary is NOT wrapped and emits as raw
// `arr == null ? void 0 : ...tail`, so short-circuit semantics survive (null arr stays undefined).
// distinct tails per slot: `!.toString()` (TSNonNullExpression), `as any` (TSAsExpression), `!.length`.
declare const arr: number[];
const a = arr?.at(-1)!.toString();
const b = arr?.at(-1) as any;
const c = arr?.at(-1)!.toFixed?.(2);
export { a, b, c };
