// A computed iterator claim keeps its member target and does not read native Symbol.
export const box = {};
({ globalThis: { Array: { prototype: { [Symbol.iterator]: box.iterator = null } } } } = globalThis);
