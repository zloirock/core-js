// `typeof F` where F is a type parameter is semantically invalid TS, but the parser
// accepts it. When the alias `X<F>` is instantiated, the substitution replaces the
// query node with the resolved type reference - shape mismatch never reaches a real
// consumer because callers branch on resolved type kind, not on TSTypeQuery wrapping.
// Distinct usage of unrelated array binding confirms unrelated polyfill flow is intact
type X<F> = typeof F;
type Y = X<number>;
declare const y: Y;
declare const arr: number[];
y;
arr.at(0);
