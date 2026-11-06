// NEGATIVE: a PLAIN value-use of the sealed nav collapses to the root - the internal `?.`
// short-circuits only the sealed value, the plain read observes it (throw semantics), and the
// non-claimable leaf keeps the locked navigation-drop canon
export const viaPlainValueUse = (globalThis.window?.self.window).Array;
