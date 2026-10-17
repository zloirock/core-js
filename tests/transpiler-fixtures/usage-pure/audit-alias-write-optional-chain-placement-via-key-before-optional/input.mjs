// an assignment-form alias write inside an optional chain is conditional exactly when an
// optional hop sits AT or BELOW the slot's host - only then may the write never run. a hop
// strictly RIGHT of the slot cuts after the write already evaluated, so the registration
// keeps full flow-trust (static narrow); guarded shapes keep the runtime constructor check
let AW, IW, MW, PW, SW;
// spine-head computed key evaluates before the later optional hop - static narrow
a[({ Array: AW } = globalThis)].b?.c;
export const viaKeyBeforeOptional = AW.of(1, 2);
