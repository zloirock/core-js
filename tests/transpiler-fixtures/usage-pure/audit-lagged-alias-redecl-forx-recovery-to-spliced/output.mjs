import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _Map from "@core-js/pure/actual/map";
// an EXPORTED lagged alias resolves through the export wrapper the same as a plain one, while the
// realm's `Map` it holds until the reassignment leaves through the export: the file takes the whole entry
export let E;
E = _Map;
E = [9];
export const r5 = _toSplicedMaybeArray(E).call(E, 0, 1);