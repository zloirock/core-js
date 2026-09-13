// A realm hop folds according to the value its consumer observes. An environment
// probe read by a kept store or a guard retains its slot over the backed root;
// plain navigation through the run follows the realm-collapse rule. Terminal
// values and computed-key effects remain observable in their original positions.
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

// An optional consumer observes the stored probe value, so the store retains window.
export const storedFolds = (k = globalThis.self.window)?.Map.length;

// ... and a harvested effect PREFIX does not revive the guard such a fold leaves behind: the
// sequence hands its tail on, and that tail is the binding the substitution landed
export const foldedPrefixGuard = (e++, globalThis).self.window?.name;

// a `?.` standing BELOW the probe hop guards the always-defined root, not the probe: the vestigial
// verdict calls it dead, so the read above it is the plain twin and folds with it. only a `?.` ON
// the probe hop is the branch the source asked for (the guarded rows above)
export const optionalUnderProbe = globalThis?.window.noSuchStatic;
export const storeUnderProbe = (k = globalThis)?.window.noSuchStatic;

// NEGATIVE: a `?.` ON the probe hop stays, and so does the read it guards
export const optionalOnProbe = globalThis.window?.noSuchStatic;

// NEGATIVE: a COMPUTED key keeps its slot - folding it would fold its effects away with it -
// and the backed run under it still collapses, so the key reads off the ponyfill
export const computedKeyStays = globalThis.self[(e++, 'window')];

// NEGATIVE: the TERMINAL hop is the value the source reads, so it keeps its slot; the backed
// run below it is what collapses, leaving the probe riding the ponyfill instead of a raw
// realm read off the pure root
export const terminalProbeRides = globalThis.self.window;

// ... and a root the collapse cannot spell changes none of it: what cannot be spelled is the root's
// OWN read, while the run above it still rides the deepest span pure can back - terminal probe and
// navigation alike. what stays raw is what nothing can spell: the bare root, and a run with no
// backed hop under it at all
export const probeRootedTerminal = window.self.window;
export const probeRootedNav = window.self.Array;
export const probeRootedUnbackedRun = window.window.customUserSlot;

export const keep = [1].at(0);
export { e, k, v };
