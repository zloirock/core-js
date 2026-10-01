// Array-destructure `const [first, mid, last] = tup` from a typed tuple
// `[string, string[], string]`: each binding picks up its slot type, so `.includes` on
// the string slots emits the string polyfill and `.findLast` on the array slot emits
// the array polyfill.
declare const tup: [string, string[], string];
const [first, mid, last] = tup;
first.includes('a');
mid.findLast(x => x);
last.at(0);
