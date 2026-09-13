// Array slots preserve known constructors read through the global object.
// Plain and optional navigation both resolve; each static has its own import.
const arraySlot = [globalThis.Array];
export const viaPlain = arraySlot[0].of(1);
const mapSlot = [globalThis?.Map];
export const viaOptional = mapSlot[0].groupBy([], value => value);
