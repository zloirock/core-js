// paren-wrapped optional member with TS wrapper followed by NON-optional outer call:
// `((arr?.includes) as any)(1)` and `((arr?.at) as any)(0)`. native semantics: nullish
// arr -> chain ends at inner `?.` -> outer `()` invokes void 0 which TypeError throws.
// expectation: paren-lookup-only rewrite should preserve throw-on-nullish for both lines.
// distinct methods (includes vs at vs flat) per line for observable per-line dispatch
const a = ((arr?.includes) as any)(1);
const b = ((arr?.at) as any)(0);
const c = ((arr?.flat) as any)();
export { a, b, c };
