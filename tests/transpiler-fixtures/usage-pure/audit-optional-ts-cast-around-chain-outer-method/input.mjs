// Polyfilled optional-chain (`.at`) inside TS expression wrappers; whether the guard ternary
// needs parens depends on whether the outer member shares the inner ChainExpression. line a
// `(arr?.at(-1) as any).repeat(2)`: source paren terminates the inner chain, outer differs, so
// WRAP so `as` binds the whole ternary. line b `arr?.at(-1)!.toString()`: chain extends through
// `!` (same ChainExpression), so SKIP wrap and short-circuit semantics survive (null arr stays void 0).
declare const arr: number[];
const a = (arr?.at(-1) as any).repeat(2);
const b = arr?.at(-1)!.toString();
export { a, b };
