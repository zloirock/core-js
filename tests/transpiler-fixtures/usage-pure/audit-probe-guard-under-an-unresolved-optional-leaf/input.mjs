// the environment-probe guard under an OPTIONAL leaf. an optional member above a probe claim
// absorbs its guard only when it RENDERS: one that resolved nothing renders nothing, and the
// guard belongs to the claim. the twin with a PROVABLE root sits beside this file - the two are
// one token apart, and over the opaque root nobody but this claim can spell the short-circuit.
globalThis.chrome = { probeSlot: 1 };
function ut() {
  globalThis.probeTick = 1;
  return globalThis;
}
// KEPT: the `?.` leaf names nothing the pure package spells, so it renders nothing
export const unresolvedLeafKeepsTheGuard = delete ut()?.window?.self?.chrome;
export const unresolvedLeafReadKeepsIt = ut()?.window?.self?.chrome;
// ... and a PLAIN leaf over the same probe keeps it too - the claim owned the guard already
export const plainLeafKeepsTheGuard = delete ut()?.window?.self.chrome;
// FOLDED: the `?.` leaf RESOLVES, so the consumer above renders and owns the whole navigation
export const resolvedLeafRidesTheConsumer = ut()?.window?.self?.Promise.resolve;
