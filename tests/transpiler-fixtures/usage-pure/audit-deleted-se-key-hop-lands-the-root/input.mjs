// Quiet realm navigation retains its delete fold. Effectful keys keep native reads and writes.
let c = 0;
delete globalThis[(c++, 'self')].a.deletedSlot;
delete globalThis.self.a.dottedTwinSlot;
export const readRidesTheHop = globalThis[(c++, 'self')].a.readSlot;
export const counted = c;
