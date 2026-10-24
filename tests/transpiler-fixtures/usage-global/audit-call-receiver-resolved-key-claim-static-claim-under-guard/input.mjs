// STRONG negatives: a guard does sit over a root inside each claim's span, yet every claim below is
// still owed - the nav feeding it was never consumed into a memo. dropping any of these would lose
// a polyfill silently, which is the only way the ownership gate can go wrong
export const staticClaimUnderGuard = globalThis.window?.self.Array.of(1).at(0);
