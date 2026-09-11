// A `.name` (MaybeFunction memoizing-get) on a proxy-global chain memoizes the receiver (`_ref = receiver`).
// The receiver's own side effect must be sourced EXACTLY ONCE - through the memo - not ALSO re-emitted as a
// prefix (which double-ran it on both emitters). When a chain-root call returning a proxy-global is harvested
// into the memo, its inner `globalThis` is rewritten to `_globalThis` (never a raw source slice -> would
// ReferenceError off-engine). distinct ctor + side-effect shape per line: hop-key SE, an inline chain-root
// call, a direct top-level SE, and a no-SE control.
let n = 0;
const hopKey = globalThis[(n += 1, 'self')].Map.name;
const chainRoot = (() => { n += 10; return globalThis; })().self.Set.name;
const directSe = (n += 100, globalThis.self.Promise).name;
const noSe = globalThis.self.WeakMap.name;
export { hopKey, chainRoot, directSe, noSe, n };
