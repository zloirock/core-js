// a SECOND `?.` over the same proxy surface asks what the memo holds. the inner hop's value is
// what the outer test reads, so the memo holds THAT - and whether it has a spelling decides the
// shape. a PLAIN proxy nav collapses to a ponyfill, leaving no member read to re-run off a memo
// base, so the inner hop renders its own guard and the memo holds the rendered conditional. every
// other inner object keeps a spelling that must be evaluated exactly once - an unknown binding, a
// kept write, an effect-bearing sequence - so the memo holds it whole and both hops fold onto it.
let w, p, cb;
let sc = 0;
// PLAIN proxy nav below the second `?.`: the memo holds the inner render
export const plainNav = globalThis.window?.self?.self.Array.prototype.flat.call([2, [3]]);
// a DEAD first `?.` (over the pristine root) is not the live probe, so the split takes the second
export const deadFirstHop = globalThis?.window?.self.Array.prototype.flat.call([4]);
// an unknown binding keeps its source chain in the memo and re-reads `.self` off it
export const openBinding = w?.self?.self.Array.prototype.flat.call([5]);
// a kept WRITE has a spelling that must run once: the memo holds the write, the hops fold
export const keptWrite = (p = globalThis.window)?.self?.self.Array.prototype.flat.call([6]);
// ... and so does an effect-bearing sequence around it
export const seqAroundWrite = (sc++, cb = globalThis.window)?.self?.self.Array.prototype.flat.call([7]);
export { w, p, cb, sc };
