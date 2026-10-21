import _globalThis from "@core-js/pure/actual/global-this";
// Quiet realm navigation retains its delete fold. Effectful keys keep native reads and writes.
let c = 0;
delete _globalThis[c++, 'self'].a.deletedSlot;
delete _globalThis.a.dottedTwinSlot;
export const readRidesTheHop = _globalThis[c++, 'self'].a.readSlot;
export const counted = c;