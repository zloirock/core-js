import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A destructure off a realm navigation with an effect buried in a sequence at its root runs the
// effect once ahead of the extraction and re-emits no raw receiver: a bare `globalThis` is a
// ReferenceError on the target engine, and `self` is undefined where the engine has none.
let c = 0;
c++;
const viaRootSe = _Map$groupBy;
export const a = viaRootSe;
c++;
// ... and so does an effect buried inside the hops
const viaTailSe = _Map$groupBy;
export const b = viaTailSe;