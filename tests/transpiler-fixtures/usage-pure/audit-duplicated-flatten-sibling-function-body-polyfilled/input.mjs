// A static declarator and a sibling function retain independent polyfill rewrites.
// The sibling function body remains live after the receiver is mirrored.
const { Array: { from } } = globalThis, { y: { at: m } } = { y: [() => Map] };
export const r = [from, m];
