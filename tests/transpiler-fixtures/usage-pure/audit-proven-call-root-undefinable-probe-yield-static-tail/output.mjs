import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
const provenProbe = () => _globalThis.window;
// the probe-yield DECOMPOSITION: one test, sourced from the call itself, and the realm hops
// fold onto the tested value - never a nested guard-value memo with its own leaf import.
// static tail, instance tail (the memo takes the CALL: `_ref = provenProbe()`), a value read
// (the alternate folds `.window` onto the substituted realm leaf), and the seq-prefixed twins
// whose buried effects ride the memo exactly once, in source order
export const probeYieldStaticTail = null == provenProbe() ? void 0 : _Array$of(1);