// optional chain on a parenthesised nested-member receiver: `(x?.a)?.b.at(0)`.
// member-annotation walk peels nullable union branches at each chain hop so the
// inner array element type propagates to the outer call site - resolver picks the
// array-specific variant
declare const x: { a: { b: string[] } } | undefined;
const r = (x?.a)?.b.at(0);
export { r };
