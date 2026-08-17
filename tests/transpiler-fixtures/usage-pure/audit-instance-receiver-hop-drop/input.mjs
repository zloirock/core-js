// the receiver of an instance dispatch is memoized RAW, so the redundant proxy hops above the
// guard's root survive as native `self` reads - the very class their ponyfill serves. once the
// guard has memoized the root the tail hangs off a ref carrying that root's provenance, and the
// shared receiver plan recognises it: the hops drop there. hops ONLY - a plan resolving a pure
// root would inject an import this channel never decided on. the runtime cannot see the
// difference (every host pairs `self` with `window`, and off-window the chain short-circuits
// before the read), so the emitted text is the lock
export const plainInstanceArm = globalThis.window?.self.box.flat(1);
export const deepNavInstanceArm = globalThis.window?.self.window.box.flat(2);

// the chain-COMBINE arm always rebuilt its tail from clones and dropped the hops - it is the
// shape the arm above now agrees with
export const chainCombineArm = globalThis.window?.self.box.flat().at(0);

// a live `?.` over a DEEP hop is not a probe either - only the FIRST hop off the root reads the
// host environment, and the guard channel cannot tell the two apart because the discriminator
// sits ABOVE it: a seal makes every short-circuit below observable. unsealed and deep, the chain
// belongs to the same collapse
export const deepHopNoProbe = globalThis.self.window?.self.Array;
export const deepHopDispatch = globalThis.self.window?.self.box.flat(3);

// POSITIVE control: the FIRST hop off the root IS the probe, and its guard stays
export const firstHopProbe = globalThis.window?.self.Array;

// POSITIVE control: a SEAL over the same deep chain makes the short-circuit observable again
export const sealedDeepHop = (globalThis.self.window?.self).Array;

// NEGATIVE: with no live `?.` the whole navigation collapses to the root, hops and all
export const noOptionalHop = globalThis.self.window.box.flat(1);
