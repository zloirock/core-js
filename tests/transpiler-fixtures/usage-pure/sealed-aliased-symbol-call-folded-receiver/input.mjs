// A sealed optional lookup through a symbol-key alias keeps its folded proxy receiver.
// Its receiver call and hop effects run once before consumption, including without a memo.
const key = Symbol.iterator;
function getRealm() { setup(); return globalThis; }
export const result = (getRealm()[(hop(), 'self')]?.[key])();
