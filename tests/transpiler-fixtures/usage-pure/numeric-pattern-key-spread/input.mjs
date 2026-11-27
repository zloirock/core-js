// An unresolved numeric slot keeps the runtime owner of Array.from.
const shifted = [...src, globalThis];
const { 0: unknown } = shifted;
export const alsoKept = unknown.Array.from([1]);
