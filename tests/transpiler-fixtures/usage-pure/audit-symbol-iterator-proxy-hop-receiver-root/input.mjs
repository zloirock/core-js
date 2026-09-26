// A proxy-global HOP receiver of a `[Symbol.iterator]` access (`globalThis.self[Symbol.iterator]`) is KEPT
// as the polyfill argument, so it must collapse to the proxy ROOT (`_globalThis`, always defined) the SAME
// way on both emitters - a kept leaf hop diverged (babel `_self` / dead `_globalThis.self.window`; unplugin
// compile-crash). all lines resolve to the same `_getIteratorMethod`/`_getIterator` import, so each is
// distinguished by RECEIVER shape: single hop, deep hop, optional hop, get-call hop, a PAREN-wrapped hop
// (oxc keeps the wrapper babel folds away - the root walk must peel it, else it stopped at the paren and
// resolved the leaf `_self`); bare-root and real-object receivers are controls (already correct).
const single = globalThis.self[Symbol.iterator];
const deep = globalThis.self.window[Symbol.iterator];
const optional = globalThis?.self[Symbol.iterator];
const getCall = [...globalThis.self[Symbol.iterator]()];
const parenWrapped = (globalThis.self)[Symbol.iterator];
const bare = globalThis[Symbol.iterator];
const real = [1][Symbol.iterator];
export { single, deep, optional, getCall, parenWrapped, bare, real };
