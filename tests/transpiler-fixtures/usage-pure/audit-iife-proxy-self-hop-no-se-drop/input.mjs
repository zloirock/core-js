// a no-effect IIFE behind a `.self` hop is dropped whole: nothing of the chain survives the
// collapse, so the inner globalThis is subsumed too (no _globalThis import) - unlike the
// SE-bearing variants where the re-emitted body keeps a live reference
const it = (() => globalThis)().self.Symbol.iterator;
