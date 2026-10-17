// the fold is INDEPENDENT of which spelling roots the probe: an alias written outside the
// sequence and the bare global root take the same fold as the same-sequence alias - the store
// hands the guarded value on either way, and the probe's `?.` slides one member up
const ga7 = globalThis;
// a PLAIN hop folds too, ERASING the `?.` above: a void store then throws on the member above
// exactly where the source threw on the hop, and over a defined value the guard was vestigial
let w9;
export const plainHopOverGuardStore = (w9 = ga7.window?.self).window?.noSuchStatic;
