import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a call root with a PROVEN DEFINED yield is the identifier spelling's twin: the delete fold
// lands the ROOT ponyfill, dead `?.`s (every test proven defined) folding with the run
const dhRoot = () => _globalThis;
export const deletedDefinedCallRoot = delete _globalThis.customQ;
export const deletedDefinedCallRootDeadOpt = delete _globalThis.customQ;
// a PROBE yield never reaches the root: the fold lands the deepest BACKED spelling instead
const dwRoot = () => _globalThis.window;
export const deletedProbeCallRoot = delete _self.customQ;
// a LIVE `?.` (its test reads the probe value) short-circuits everything above it, the
// deleted member included: the guard stays, the member outside behind a `?.` of its own
export const deletedLiveGuardCallRoot = delete (null == dhRoot().window ? void 0 : _self)?.customQ;
// a paren seal over the run hides no short-circuit - the fold reads through it on both
// paren dialects (the flag spelling and the node spelling answer the same)
export const deletedSealedProbeRun = delete _self.customQ;