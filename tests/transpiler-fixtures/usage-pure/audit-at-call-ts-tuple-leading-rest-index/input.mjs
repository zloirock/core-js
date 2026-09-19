// leading-rest tuple `[...string[], number]` makes positional indexing semantically
// ambiguous: the rest's runtime length is unknown, so `T[1]` could be either a string
// (when the rest holds 2+ elements) or the trailing number (when rest is empty). picking
// `elements[1]=number` would narrow to a primitive without `at`, dropping the polyfill -
// generic instance dispatch is the safe widening for any rest-before-index case
type Path = [...string[], number];
declare const p: Path;
p[1].at(0);
