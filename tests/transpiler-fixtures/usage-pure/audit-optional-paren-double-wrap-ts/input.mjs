// Parentheses and erased TS wrappers preserve the adjacent-read receiver contract.
// Wrapping a bare identifier adds no runtime effect and requires no receiver capture.
const a = (((arr) as any))?.at?.(0);
const b = ((arr! as any))?.flat?.();
const c = (((arr as any) as any))?.includes?.('x');
export { a, b, c };
