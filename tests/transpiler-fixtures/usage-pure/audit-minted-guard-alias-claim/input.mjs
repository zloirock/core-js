// an alias whose init is the MINTED guard (the in-place collapse rewrote it before this claim
// resolved): classification follows the marked defined branch on BOTH legs - the mark rides
// the render canon's factory and survives the babel conversion - and the claim probes like
// the plain alias twin
const heldGuardSelf = globalThis.window?.self;
export const mintedGuardAliasClaim = String(heldGuardSelf.Array.of(21));
export const mintedGuardAliasFallback = heldGuardSelf.Promise;
