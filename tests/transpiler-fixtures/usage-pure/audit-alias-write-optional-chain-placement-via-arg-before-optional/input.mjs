// an assignment-form alias write inside an optional chain is conditional exactly when an
// optional hop sits AT or BELOW the slot's host - only then may the write never run. a hop
// strictly RIGHT of the slot cuts after the write already evaluated, so the registration
// keeps full flow-trust (static narrow); guarded shapes keep the runtime constructor check
let AW, IW, MW, PW, SW;
// call argument of a NON-optional call, cut after - static narrow
f(({ Iterator: IW } = globalThis))?.next;
export const viaArgBeforeOptional = IW.from(src);
