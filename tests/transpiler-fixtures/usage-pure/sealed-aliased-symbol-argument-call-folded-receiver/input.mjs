// An argument call after a sealed optional symbol lookup keeps the folded proxy as this.
// Its receiver call and hop effects must not replay in the key's guarded evaluation.
const key = Symbol.iterator;
function getRealm() { setup(); return globalThis; }
export const result = (getRealm()[(hop(), 'self')]?.[key])(42);
