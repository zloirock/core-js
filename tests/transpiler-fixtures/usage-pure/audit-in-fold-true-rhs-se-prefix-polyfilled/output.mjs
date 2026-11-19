import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// usage-pure `in`-check folding to true: the RHS SequenceExpression prefix is preserved verbatim in
// the replacement, so a polyfillable API inside it must still be injected - only the dropped
// in-operand tail (`Array`) is skipped. emits `(_atMaybeArray(arr).call(arr, 0), true)` rather than
// leaving `arr.at` raw (which would TypeError on ie11).
const arr = [1];
export const h = (_atMaybeArray(arr).call(arr, 0), true);