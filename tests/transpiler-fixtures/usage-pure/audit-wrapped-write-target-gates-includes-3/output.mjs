import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// a wrapped for-x write slot is a per-iteration rebind, never the inherited method
const frr: number[] = [];
for (frr.at of [[1]]) break;
export const r5 = _includesMaybeArray(frr).call(frr, 1);