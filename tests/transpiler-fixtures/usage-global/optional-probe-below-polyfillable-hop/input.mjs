// a `?.` over a hop the build serves is dead once substituted, but a probe below that hop can still
// short-circuit the whole chain, so that probe takes the guard. a kept write of `window` under a doubled
// `self` hop is one: where `window` is absent the chain answers undefined instead of reading off the
// void store
let n;
export const instanceClaim = (n = globalThis.window)?.self?.self.getBox().at(0);
export const combinedClaim = (n = globalThis.window)?.self?.self.box.flat?.().findLast(Boolean);
// NEGATIVE: a probe below that cannot short-circuit is dead with the hop above it
export const deadProbe = (() => globalThis)()?.self?.WeakSet.name;
export { n };
