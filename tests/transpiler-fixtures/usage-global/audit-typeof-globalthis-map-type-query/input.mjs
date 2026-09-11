// `typeof globalThis.Map` type query references the global through a proxy-global member;
// the qualified name must be walked so `Map` deps (and `globalThis`) are injected, not just
// the root proxy global
let x: typeof globalThis.Map;
export { x };
