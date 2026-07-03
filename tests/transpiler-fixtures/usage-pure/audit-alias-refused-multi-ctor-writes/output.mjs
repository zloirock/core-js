import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// ONE binding written from TWO different destructured globals is dirty - its registration is
// refused; the value swaps still land in write order and the member read gets the RUNTIME
// ctor guard keyed on the LAST write's hint (the merge is position-deterministic), so the
// straight-line flow reads the pure static and any other flow falls to the raw read
let M;
M = _Map;
M = _Promise;
export const r = typeof (M === _Promise ? _Promise$try : M.try);
export const q = typeof M.groupBy;