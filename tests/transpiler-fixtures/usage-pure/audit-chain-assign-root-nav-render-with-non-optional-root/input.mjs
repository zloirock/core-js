// A proxy navigation over a chain assignment keeps the assigned value and its effects. The guard and any collapsed tail must read
// that same value.
globalThis.assignBox = { list: ['ab', 'cd'], n: 1 };
let heldNonOptional;
export const withNonOptionalRoot = (heldNonOptional = globalThis).window?.self.assignBox.list?.at(0);
export { heldNonOptional };
