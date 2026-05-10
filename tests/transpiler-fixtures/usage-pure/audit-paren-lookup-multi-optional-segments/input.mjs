// multiple `?.` segments in the chain: `(arr?.b?.c.includes)(1)`. each optional
// contributes its own null-check; outer paren-lookup memoizes the deepest receiver
// (arr?.b?.c) so the .call binds it correctly while throwing on any nullish hop
declare const arr: { b?: { c: number[] } } | null;
const r = (arr?.b?.c.includes)(1);
