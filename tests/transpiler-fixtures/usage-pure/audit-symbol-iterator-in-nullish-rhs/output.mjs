import _Array$from from "@core-js/pure/actual/array/from";
import _isIterable from "@core-js/pure/actual/is-iterable";
// `Symbol.iterator in (a ?? b)` - nullish-coalescing on the RHS. The entire logical
// expression is wrapped through `_isIterable` while preserving the `??` short-circuit
// semantics. Inner `Array.from(src)` resolves independently.
const x = _isIterable(a ?? b);
const y = _isIterable(_Array$from(src) ?? c);
export { x, y };