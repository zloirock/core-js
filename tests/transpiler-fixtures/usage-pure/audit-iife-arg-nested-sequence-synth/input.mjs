// nested comma expression in IIFE arg `(a, (b, R))` evaluates to R, same as flat
// `(a, b, R)`. comma-tail extraction recursively peels both outer and inner sequences
// so the inner identifier `Array` reaches the receiver classifier and the rewrite emits
// `{from: _Array$from}`, classifying the nested form identically to the flat form
const r = (({ from }) => from([1, 2, 3]))((0, (1, Array)));
export { r };
