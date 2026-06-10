// static-FALLBACK receiver (`.noSuchStatic` is not a known static on Promise) that is a kept
// SE-bearing IIFE: the receiver swap is REDUNDANT - the re-emitted call's own rewritten return
// (`return _Promise`) already yields the polyfill binding, so the member stays untouched (no
// `(call(), _Promise)` wrapper) and the setup runs exactly once
let called = 0;
const m = (() => {
  called++;
  return Promise;
})().noSuchStatic;
