import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
const crr: string[] = ["c"];
(crr.includes as any) += "y";
export const r3 = _includesMaybeArray(crr).call(crr, "c");