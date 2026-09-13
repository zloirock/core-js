import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _self from "@core-js/pure/actual/self";
// Repeated writes of the same realm object keep the alias trustworthy at both reads.
// The plain window.self navigation lands on the backed self entry while assignments remain.
// Pattern writes to M store different constructors; identity checks preserve the selected value.
let v, g, out, out2;
out = (g = _globalThis, v = _self, _Promise$race).zzz;
out2 = (g = _globalThis, v = _self, _Promise$race).zzz;
let M;
M = _Map;
M = _Promise;
export const untrusted = typeof (M === _Map ? _Map$groupBy : M.groupBy);
export const read = [out, out2];