import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
var _ref;
// Chain extending through TS wrappers without any source paren: optional chain spans
// `?.at(-1)` polyfillable + TS `!`/`as`/`satisfies` + continued regular member access
// inside the SAME ChainExpression. `sharesChainExpression(metaPath, outer)` returns true
// for these shapes, so `guardNeedsParens` skips wrapping the ternary; the polyfill
// emits as raw `arr == null ? void 0 : ...<tail>` and short-circuit semantics survive
// (arr null -> entire chain resolves to undefined, no further methods invoked).
// distinct continuation tails per slot:
//   `!.toString()`  - TSNonNullExpression then regular member call
//   `as any .padEnd` - TSAsExpression then regular member call (no outer paren, chain
//                     extends)
//   `!.length`      - TSNonNullExpression then property access (no call)
declare const arr: number[];
const a = arr == null ? void 0 : _atMaybeArray(arr).call(arr, -1)!.toString();
const b = (arr == null ? void 0 : _atMaybeArray(arr).call(arr, -1)) as any;
const c = arr == null ? void 0 : _toFixedMaybeNumber(_ref = _atMaybeArray(arr).call(arr, -1)!)?.call(_ref, 2);
export { a, b, c };