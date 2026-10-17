// absent element with a receiver default: the hole fires the default, which is mirrored whole
const [{ WeakSet: K } = globalThis] = [];
export const viaAbsentPair = new K();
