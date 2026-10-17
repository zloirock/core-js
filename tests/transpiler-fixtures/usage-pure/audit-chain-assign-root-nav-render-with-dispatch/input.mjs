// A proxy navigation over a chain assignment keeps the assigned value and its effects. The guard and any collapsed tail must read
// that same value.
globalThis.assignBox = { list: ['ab', 'cd'], n: 1 };
let heldDispatch;
export const withDispatch = (heldDispatch = globalThis)?.window?.self.assignBox.list?.at(0);
export { heldDispatch };
