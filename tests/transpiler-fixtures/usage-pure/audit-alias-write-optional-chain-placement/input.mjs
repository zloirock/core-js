// an assignment-form alias write inside an optional chain is conditional exactly when an
// optional hop sits AT or BELOW the slot's host - only then may the write never run. a hop
// strictly RIGHT of the slot cuts after the write already evaluated, so the registration
// keeps full flow-trust (static narrow); guarded shapes keep the runtime constructor check
let AW, IW, MW, PW, SW;

// spine-head computed key evaluates before the later optional hop - static narrow
a[({ Array: AW } = globalThis)].b?.c;
export const viaKeyBeforeOptional = AW.of(1, 2);

// call argument of a NON-optional call, cut after - static narrow
f(({ Iterator: IW } = globalThis))?.next;
export const viaArgBeforeOptional = IW.from(src);

// argument of an OPTIONAL call may never evaluate - guarded
host?.doThing(({ Map: MW } = globalThis));
export const viaOptionalCallArg = MW.groupBy(items, tag);

// computed key under an optional member may never evaluate - guarded
a?.[({ Promise: PW } = globalThis)];
export const viaOptionalMemberKey = PW.allSettled(list);

// deep chain: the call is plain but an optional hop sits below its callee - guarded
a?.b.c(({ Symbol: SW } = globalThis));
export const viaOptionalSpineArg = SW.for(wellKnownKey);

// an optional hop in the HOST's spine guards the key even through deeper composition - guarded
let NK;
a?.b[({ Number: NK } = globalThis)].c;
export const viaOptionalSpineKey = NK.isFinite(value);

// a logical object is still an unconditionally-reached spine: both arms lead to the member
// access, so the key always evaluates - static narrow
let JK;
(a ?? b)[({ JSON: JK } = globalThis)].c;
export const viaLogicalSpineKey = JK.rawJSON(input);
