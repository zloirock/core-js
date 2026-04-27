import _isIterable from "@core-js/pure/actual/is-iterable";
import _Array$from from "@core-js/pure/actual/array/from";
// `Symbol.iterator in (a ?? b)` - nullish-coalescing on the RHS. handleBinaryIn
// must wrap the entire LogicalExpression through `_isIterable` while preserving the
// `??` short-circuit shape. inner `Array.from(src)` resolves independently.
const x = _isIterable((a ?? b));
const y = _isIterable((_Array$from(src) ?? c));
export { x, y };