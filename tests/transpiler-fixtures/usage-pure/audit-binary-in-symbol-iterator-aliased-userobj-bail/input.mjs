// `g` aliases an arbitrary user object (someObj), not the global, so `g.Symbol.iterator in
// arr` is NOT the global iterator probe. No Symbol-iterator subsumption fires and the `in`
// operator stays a general property-membership check.
const g = someObj;
const r = g.Symbol.iterator in arr;
[r];
