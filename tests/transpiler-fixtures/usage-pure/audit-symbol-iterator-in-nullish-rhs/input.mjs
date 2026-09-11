// `Symbol.iterator in (a ?? b)` - nullish-coalescing on the RHS. The entire logical
// expression is wrapped through `_isIterable` while preserving the `??` short-circuit
// semantics. Inner `Array.from(src)` resolves independently.
const x = Symbol.iterator in (a ?? b);
const y = Symbol.iterator in (Array.from(src) ?? c);
export { x, y };
