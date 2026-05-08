import _Set from "@core-js/pure/actual/set/constructor";
// negative literal in conditional check lock: `T extends -1 ? A : B` where `-1` is parsed
// as UnaryExpression{ argument: NumericLiteral{value: 1} }. before the fix, the comparison
// in pickConditionalBranchByAST read `literal.value` (undefined for UnaryExpression), so
// any conditional involving negative literals was undecidable. after the fix, literalNodeValue
// resolves UnaryExpression - to its negated argument value, decidable conditionals like
// `-1 extends -1` collapse to the true branch (Set with intersection polyfill) and the false
// branch (Map.values which is also polyfilled but with a different signature) is pruned
type IsNegOne<T> = T extends -1 ? Set<number> : Map<string, number>;
declare const x: IsNegOne<-1>;
const merged = x.intersection(new _Set([1, 2]));
export { merged };