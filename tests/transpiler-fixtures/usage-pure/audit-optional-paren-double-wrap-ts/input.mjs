// Optional access through paren-wrapped TS expressions (`(...) as any`, `arr!`) must allocate `_ref`.
// Paren peel cannot bypass the TS-wrapper rule, otherwise the wrapped receiver would be re-evaluated.
const a = (((arr) as any))?.at?.(0);
const b = ((arr! as any))?.flat?.();
const c = (((arr as any) as any))?.includes?.('x');
export { a, b, c };
