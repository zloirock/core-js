import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _self from "@core-js/pure/actual/self";
// TWO writes of the SAME proxy global are one value: the alias holds that global whichever write ran,
// so the read needs no sole-write proof. without the agreement arm the verdict flipped mid-file - this
// emitter rewrites the first write into its pure spelling, and the next read of the alias then saw a
// different write set than the read before it, so the two identical expressions below rendered
// differently (the first lost the probe the second kept).
// the negative is `M`: a PATTERN left stores a property of the global, never the global, so two such
// writes are two different constructors and stay untrusted
let v, g, out, out2;
out = null == (g = _globalThis, v = null == g.window ? void 0 : _self) ? void 0 : _Promise$race.zzz;
out2 = null == (g = _globalThis, v = null == g.window ? void 0 : _self) ? void 0 : _Promise$race.zzz;
let M;
M = _Map;
M = _Promise;
export const untrusted = typeof (M === _Map ? _Map$groupBy : M.groupBy);
export const read = [out, out2];