// `A` is unconditionally reassigned from one proxy-global to another (`globalThis` -> `self`) before
// the use, so the reassignment DOMINATES - but the reaching value is ITSELF a proxy-global, so `A`
// still names the surface at the use and `A.Array.from` collapses to the pure static (a non-proxy
// reaching value would keep the receiver native)
let A = globalThis;
A = self;
A.Array.from([1, 2, 3]);
