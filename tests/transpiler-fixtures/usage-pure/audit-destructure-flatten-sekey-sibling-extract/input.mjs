// A flattened globalThis.Array.from leaf shares its declaration with an effectful computed Array.of
// key. The second receiver is captured at its own declarator, then the key effect runs once before
// the pure Array.of binding.
const effects = [];
const { Array: { from } } = globalThis, { [(effects.push('k'), 'of')]: of } = Array;
export const r = [typeof from, typeof of, effects.length];
export { effects };
