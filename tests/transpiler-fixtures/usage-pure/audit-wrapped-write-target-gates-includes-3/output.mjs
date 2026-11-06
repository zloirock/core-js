import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// a wrapped for-x write slot is a per-iteration rebind, never the inherited method
const frr: number[] = [];
// @ts-expect-error a loop head write tsc refuses is the shape under test
for (frr.at of [[1]]) break;
export const r5 = _includesMaybeArray(frr).call(frr, 1);