import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
// `Pair['length']` indexed-access on a tuple resolves to a numeric literal at TS level.
// type-driven inference uses this to recognize `n` as a number, gating the polyfill choice
// for the result of `.toFixed()` (string -> bigint variants would be wrong otherwise).
// without explicit `length` handling, `Number('length') === NaN` silently dropped the lookup
type Pair = [string, string];
const arity: Pair['length'] = 2;
const repr = _toFixedMaybeNumber(arity).call(arity, 0);
export { repr };