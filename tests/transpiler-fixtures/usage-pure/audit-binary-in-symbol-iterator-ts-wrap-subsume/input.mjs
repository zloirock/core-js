// well-known symbol membership probe with TS cast wrapping the proxy-global root;
// the outer iterator helper subsumes the chain, the wrapper must not trigger a
// duplicate polyfill pass on the inner globalThis identifier
declare const arr: number[];
const r = (globalThis as any).Symbol.iterator in arr;
[r];
