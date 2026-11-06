// A sealed optional lookup through a symbol-key alias captures its folded proxy receiver.
// Its receiver call and hop effects belong to that capture and run once before consumption.
const key = Symbol.iterator;
function getRealm() { setup(); return globalThis; }
export const result = (getRealm()[(hop(), 'self')]?.[key])();
