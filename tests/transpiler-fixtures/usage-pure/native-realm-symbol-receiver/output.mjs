import _self from "@core-js/pure/actual/self";
// A native root leaves a backed receiver hop to its own claim.
export const r = _self[Symbol.iterator];