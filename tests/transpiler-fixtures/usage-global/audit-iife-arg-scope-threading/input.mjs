// an IIFE call-arg evaluates AT THE CALL SITE: the union and the meta resolve it in the
// OUTER scope. distinct method per row attributes each arm.
// param-default arm: the LIVE arg supersedes the dead default, and its reachable
// reassignment targets join the union
let R = Object;
if (globalThis.cond) R = Array;
export const viaDefaultArm = (({ from } = Map) => from)(R);

// a param SHADOWING the arg's name must not swallow the receiver (param-default arm)
export const viaShadowDefault = !function ({ of } = WeakMap, Array) { return of; } (Array);

// same shadow through the no-default arm
export const viaShadowBare = !function ({ fromAsync }, Array) { return fromAsync; } (Array);

// no call-arg: the default IS live - its own target resolves
export const viaLiveDefault = (({ from } = Iterator) => from)();

// an SE-wrapped arg peels for classification while the effect stays in place
export const viaSeArg = !function ({ entries }, Object) { return entries; } ((eff(), Object));

// a maybe-undefined arg is not a usable receiver - the default stays the union source
export const viaMaybeArg = (({ groupBy } = Map) => groupBy)(maybe);

// a proxy-global MEMBER arg resolves at the call site through the shadow too
export const viaMemberArg = !function ({ resolve }, Promise) { return resolve; } (globalThis.Promise);

// the reachable-union of a reassigned outer binding flows through a SHADOWED AP arg:
// candidates resolve at the call site, so the shadow cannot swallow the union
let R2 = WeakSet;
if (globalThis.cond) R2 = Iterator;
export const viaShadowUnion = !function ({ concat } = Map, R2) { return concat; } (R2);
