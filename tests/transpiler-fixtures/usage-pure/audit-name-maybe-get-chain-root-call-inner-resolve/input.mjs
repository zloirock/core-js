// A `.name` (MaybeFunction get) memoizes a proxy-global chain-root-call receiver as `_ref = (call, _Ctor)`.
// The call is harvested + re-emitted as a RAW source prefix, but its inner content must be resolved EXACTLY
// as the natural visitor would (the whole receiver collapse leaves the call's body visitor-rewritten and the
// transform-queue compose substitutes through it) - NOT a hand-rolled identifier-only re-emit. Two inner
// shapes a bare-identifier re-emit could not handle: a proxy-global MEMBER chain return (`globalThis.self`
// must collapse to the leaf `_self`, not a dead `_globalThis.self` hop) and a polyfillable member inside the
// call body (`[1].flat()` must polyfill). a SEQUENCE-wrapped receiver `(n, (call).self)` must peel to the
// chain-root call inside its tail (else its inner `globalThis` stranded raw). a bare control return anchors
// the common shape. distinct ctor per line.
let n = 0;
const memberChain = (() => { n += 1; return globalThis.self; })().window.Map.name;
const polyfillable = (() => { [1].flat(); return globalThis; })().self.Set.name;
const seqWrapped = (n += 10, (() => { n += 100; return globalThis; })().self).Promise.name;
const control = (() => { n += 1000; return globalThis; })().self.WeakMap.name;
export { memberChain, polyfillable, seqWrapped, control, n };
