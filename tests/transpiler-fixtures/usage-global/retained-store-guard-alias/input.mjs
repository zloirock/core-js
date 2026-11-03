// A retained guard writes the source receiver before the sealed read. Later aliases
// keep that proof until a new user write; a repeated render must not add an identity test.
let held;
export const first = ((held = globalThis.window)?.self).Array.from([1]);
export const second = held?.Map;
held = other;
export const changed = held?.Set;
