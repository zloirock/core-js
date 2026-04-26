// `export type { X }` is type-only and stays as-is, even if the exported name
// matches a polyfillable global.
type Set = unknown;
type Map<T> = T;
interface WeakSet {}
export { type Set, type Map, type WeakSet };