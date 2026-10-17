// the fold is INDEPENDENT of which spelling roots the probe: an alias written outside the
// sequence and the bare global root take the same fold as the same-sequence alias - the store
// hands the guarded value on either way, and the probe's `?.` slides one member up
const ga7 = globalThis;
let w7;
export const aliasWrittenElsewhere = (w7 = ga7.window?.self)?.window.noSuchStatic;
