import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
var _ref;
// WHICH realm hop the collapse keeps is positional, not name-based. reading off the SOURCE ROOT a
// hop pure cannot back is the environment probe and its `?.` is load-bearing; standing over a
// ponyfill - a backed hop below it, or the leaf a collapse landed - the same hop is a read THROUGH
// that ponyfill, which off-browser cannot answer it, so it folds onto the leaf with its `?.`. what
// no position folds is a TERMINAL unbacked hop whose value the source itself reads: it rides off
// the deepest ponyfill the run can hand it, keeping the slot a computed key keeps too
let e = 0;
let k;
let v;

// the probe reads off the root - guard kept, and the hop above it folds into the alternate
export const probeKeptTailFolds = null == _globalThis.window ? void 0 : _self.noSuchStatic;
export const probeKeptTailTerminal = null == _globalThis.window ? void 0 : _self;

// ... the same over an opaque-but-proven root
const proven = () => _globalThis;
export const provenRootTailFolds = null == proven().window ? void 0 : _self.chrome;

// a hop BETWEEN two backed hops is read through as much as one above them
export const stackedFolds = null == (v = _self) ? void 0 : _Number$MAX_SAFE_INTEGER;

// a stored value lands the ponyfill the fold leaves behind, not a raw realm read off it
export const storedFolds = null == (k = _self) ? void 0 : _Map.length;

// ... and a harvested effect PREFIX does not revive the guard such a fold leaves behind: the
// sequence hands its tail on, and that tail is the binding the substitution landed
export const foldedPrefixGuard = (e++, _globalThis).name;

// a `?.` standing BELOW the probe hop guards the always-defined root, not the probe: the vestigial
// verdict calls it dead, so the read above it is the plain twin and folds with it. only a `?.` ON
// the probe hop is the branch the source asked for (the guarded rows above)
export const optionalUnderProbe = _globalThis.noSuchStatic;
export const storeUnderProbe = (k = _globalThis, _globalThis).noSuchStatic;

// NEGATIVE: a `?.` ON the probe hop stays, and so does the read it guards
export const optionalOnProbe = _globalThis.window?.noSuchStatic;

// NEGATIVE: a COMPUTED key keeps its slot - folding it would fold its effects away with it -
// and the backed run under it still collapses, so the key reads off the ponyfill
export const computedKeyStays = _self[e++, 'window'];

// NEGATIVE: the TERMINAL hop is the value the source reads, so it keeps its slot; the backed
// run below it is what collapses, leaving the probe riding the ponyfill instead of a raw
// realm read off the pure root
export const terminalProbeRides = _self.window;

// ... and a root the collapse cannot spell changes none of it: what cannot be spelled is the root's
// OWN read, while the run above it still rides the deepest span pure can back - terminal probe and
// navigation alike. what stays raw is what nothing can spell: the bare root, and a run with no
// backed hop under it at all
export const probeRootedTerminal = _self.window;
export const probeRootedNav = _self.Array;
export const probeRootedUnbackedRun = window.window.customUserSlot;
export const keep = _atMaybeArray(_ref = [1]).call(_ref, 0);
export { e, k, v };