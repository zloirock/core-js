// WHICH realm hop the collapse keeps is positional, not name-based. reading off the SOURCE ROOT a
// hop pure cannot back is the environment probe and its `?.` is load-bearing; standing over a
// ponyfill - a backed hop below it, or the leaf a collapse landed - the same hop is a read THROUGH
// that ponyfill, which off-browser cannot answer it, so it folds onto the leaf with its `?.`. two
// hops keep their slot either way: a computed key, whose effects would fold with it, and a spine
// with no probe under it at all, where there is no collapse to fold onto
let e = 0;
let k;
let v;

// the probe reads off the root - guard kept, and the hop above it folds into the alternate
export const probeKeptTailFolds = globalThis.window?.self.window.noSuchStatic;
export const probeKeptTailTerminal = globalThis.window?.self.window;

// ... the same over an opaque-but-proven root
const proven = () => globalThis;
export const provenRootTailFolds = proven()?.window?.self?.window?.chrome;

// a hop BETWEEN two backed hops is read through as much as one above them
export const stackedFolds = (v = globalThis.self?.window?.self)?.Number.MAX_SAFE_INTEGER;

// a stored value lands the ponyfill the fold leaves behind, not a raw realm read off it
export const storedFolds = (k = globalThis.self.window)?.Map.length;

// a `?.` standing BELOW the probe hop guards the always-defined root, not the probe: the vestigial
// verdict calls it dead, so the read above it is the plain twin and folds with it. only a `?.` ON
// the probe hop is the branch the source asked for (the guarded rows above)
export const optionalUnderProbe = globalThis?.window.noSuchStatic;
export const storeUnderProbe = (k = globalThis)?.window.noSuchStatic;

// NEGATIVE: a `?.` ON the probe hop stays, and so does the read it guards
export const optionalOnProbe = globalThis.window?.noSuchStatic;

// NEGATIVE: a COMPUTED key keeps its slot - folding it would fold its effects away with it
export const computedKeyStays = globalThis.self[(e++, 'window')];

// NEGATIVE: no probe under the run means no collapse to fold onto, and the whole spine stays
export const standsDown = globalThis.self.window;

export const keep = [1].at(0);
export { e, k, v };
