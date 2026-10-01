import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
var _ref;
// Chain extending through TS wrappers without any source paren: the optional chain spans
// `?.at(-1)` + TS `!`/`as` + continued member access inside the SAME ChainExpression. since the
// outer member shares that chain, the guard ternary is NOT wrapped and emits as raw
// `arr == null ? void 0 : ...tail`, so short-circuit semantics survive (null arr stays undefined).
// distinct tails per slot: `!.toString()` (TSNonNullExpression), `as any` (TSAsExpression), `!.length`.
declare const arr: number[];
const a = arr == null ? void 0 : _atMaybeArray(arr).call(arr, -1)!.toString();
const b = (arr == null ? void 0 : _atMaybeArray(arr).call(arr, -1)) as any;
const c = arr == null ? void 0 : _toFixedMaybeNumber(_ref = _atMaybeArray(arr).call(arr, -1)!)?.call(_ref, 2);
export { a, b, c };