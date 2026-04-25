// optional chain on a typed nested-member receiver: `(x?.a)?.b.at(0)`. ESTree wraps the
// outer optional in `ChainExpression`; plugin peels that wrapper so the rewrite emits
// without crashing on the wrapper shape (parity with babel which strips the wrap by default).
// type narrowing through `| undefined` union doesn't propagate the inner array element type
// here - documented precision limit, output uses the generic instance polyfill rather than
// the array-specific variant
declare const x: { a: { b: string[] } } | undefined;
const r = (x?.a)?.b.at(0);
export { r };
