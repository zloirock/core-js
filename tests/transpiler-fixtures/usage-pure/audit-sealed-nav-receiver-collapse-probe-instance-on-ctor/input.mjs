// a SEALED probe nav under a claim the RECEIVER channel erases: `(nav).Map` collapses to the
// ponyfill ctor and the dispatch above reads off it, dropping the read the source performs on the
// sealed value. that read comes back as a throw probe, the same one the claim channel emits for
// every shape that keeps its receiver - the rows below enumerate both families
export const instanceOnCtor = (globalThis.window?.self).Map.name;
