// a `?.` on the first hop off a proven realm root reads a value the collapse assumption defines, so
// the unbacked realm hops standing above it fold onto the ponyfill exactly as the plain twin's do.
// the verdict is about what the READ's own receiver yields - asked one link down instead, the run
// above that link was called a probe and kept a guard its plain twin has never had
export const rootOptionalRun = globalThis?.window.window?.self.chrome;
export const rootOptionalOverBoth = globalThis?.window.window?.self?.crypto;
export const rootOptionalLongRun = globalThis?.window.window.window?.self?.origin;

// the same runs with the root read PLAINLY - the shape whose bytes the rows above must match
export const plainTwin = globalThis.window.window?.self?.name;
export const plainTwinLongRun = globalThis.window.window.window?.self?.origin;

// NEGATIVE: a SINGLE unbacked hop under the guard IS the environment probe, whichever way the root
// above it is spelled, so the test the source wrote stands
export const probeHop = globalThis?.window?.self?.length;
export const probeHopPlainRoot = globalThis.window?.window?.self?.status;
