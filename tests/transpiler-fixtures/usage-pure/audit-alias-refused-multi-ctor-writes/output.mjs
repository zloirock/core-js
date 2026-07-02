import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// ONE binding written from TWO different destructured globals is dirty - its registration is
// refused and member reads stay raw; the value swaps still land in write order
let M;
M = _Map;
M = _Promise;
export const r = typeof M.try;
export const q = typeof M.groupBy;