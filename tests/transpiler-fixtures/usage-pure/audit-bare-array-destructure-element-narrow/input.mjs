// `const [a] = pair` where `pair: [string, number]`: element type for index 0 is
// string. expect `a.at(0)` to narrow to the string instance polyfill, not the
// generic Array variant. confirms resolving the annotation of a destructured
// binding does not leak the whole tuple annotation through the init walk.
const pair: [string, number] = ['hi', 1];
const [a] = pair;
a.at(0);
