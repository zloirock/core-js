// `Symbol.iterator in (a ?? b)` - nullish-coalescing on the RHS. handleBinaryIn
// must wrap the entire LogicalExpression through `_isIterable` while preserving the
// `??` short-circuit shape. inner `Array.from(src)` resolves independently.
const x = Symbol.iterator in (a ?? b);
const y = Symbol.iterator in (Array.from(src) ?? c);
export { x, y };
