// A proxy navigation over a chain assignment keeps the assigned value and its effects. The guard and any collapsed tail must read
// that same value.
globalThis.assignBox = { list: ['ab', 'cd'], n: 1 };
let heldPlain;
export const withPlainTail = (heldPlain = globalThis)?.window?.self.assignBox.n;
export { heldPlain };
