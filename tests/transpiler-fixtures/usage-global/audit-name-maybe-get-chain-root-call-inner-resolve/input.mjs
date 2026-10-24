// usage-global counterpart: the member-expression stays verbatim, so this locks that DETECTION resolves the
// polyfills THROUGH a proxy-global chain-root call - the `.name` MaybeFunction on each collapsed ctor, the
// inner proxy-global member chain (`globalThis.self` -> web.self), and the polyfillable member inside the
// call body (`[1].flat()` -> es.array.flat) plus a SEQUENCE-wrapped receiver - and injects every side-effect
// import. distinct ctor per line.
let n = 0;
const memberChain = (() => { n += 1; return globalThis.self; })().window.Map.name;
const polyfillable = (() => { [1].flat(); return globalThis; })().self.Set.name;
const seqWrapped = (n += 10, (() => { n += 100; return globalThis; })().self).Promise.name;
const control = (() => { n += 1000; return globalThis; })().self.WeakMap.name;
export { memberChain, polyfillable, seqWrapped, control, n };
