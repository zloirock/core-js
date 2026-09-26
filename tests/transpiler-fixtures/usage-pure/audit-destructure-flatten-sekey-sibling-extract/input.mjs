// A globalThis.Array.from leaf, mirrored in place, shares its declaration with an effectful computed
// Array.of key: the key effect runs once before the pure Array.of binding, and the proven constructor
// receiver needs no capture of its own.
const effects = [];
const { Array: { from } } = globalThis, { [(effects.push('k'), 'of')]: of } = Array;
export const r = [typeof from, typeof of, effects.length];
export { effects };
