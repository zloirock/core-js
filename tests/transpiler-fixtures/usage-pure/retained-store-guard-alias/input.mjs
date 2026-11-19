// A retained guard writes the source receiver before the sealed read. A later alias
// may select the polyfill only for the realm value; a user write invalidates that source.
let held;
export const first = ((held = globalThis.window)?.self).Array.from([1]);
export const second = held?.Map;
held = other;
export const changed = held?.Set;
