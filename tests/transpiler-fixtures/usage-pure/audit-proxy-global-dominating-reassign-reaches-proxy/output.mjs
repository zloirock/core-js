import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// `A` is unconditionally reassigned from one proxy-global to another (`globalThis` -> `self`) before
// the use, so the reassignment DOMINATES - but the reaching value is ITSELF a proxy-global, so `A`
// still names the surface at the use and `A.Array.from` collapses to the pure static (a non-proxy
// reaching value would keep the receiver native)
let A = _globalThis;
A = _self;
_Array$from([1, 2, 3]);