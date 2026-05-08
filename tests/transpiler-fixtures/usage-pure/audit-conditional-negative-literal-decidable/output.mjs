import _Set from "@core-js/pure/actual/set/constructor";
// `-1` is parsed as a unary expression, not a literal; conditional branch picking must evaluate it.
// Without negative-literal handling, `T extends -1 ? Set : Map` would stay undecidable and miss the Set branch.
type IsNegOne<T> = T extends -1 ? Set<number> : Map<string, number>;
declare const x: IsNegOne<-1>;
const merged = x.intersection(new _Set([1, 2]));
export { merged };