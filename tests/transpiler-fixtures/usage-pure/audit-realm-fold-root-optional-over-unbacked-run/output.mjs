import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a `?.` on the first hop off a proven realm root reads a value the collapse assumption defines, so
// the unbacked realm hops standing above it fold onto the ponyfill exactly as the plain twin's do.
// the verdict is about what the READ's own receiver yields - asked one link down instead, the run
// above that link was called a probe and kept a guard its plain twin has never had
export const rootOptionalRun = _self.chrome;
export const rootOptionalOverBoth = _self.crypto;
export const rootOptionalLongRun = _self.origin;

// the same runs with the root read PLAINLY - the shape whose bytes the rows above must match
export const plainTwin = _self.name;
export const plainTwinLongRun = _self.origin;

// NEGATIVE: a SINGLE unbacked hop under the guard IS the environment probe, whichever way the root
// above it is spelled, so the test the source wrote stands
export const probeHop = null == _globalThis.window ? void 0 : _self.length;
export const probeHopPlainRoot = null == _globalThis.window?.window ? void 0 : _self.status;