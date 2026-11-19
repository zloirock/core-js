// the plain (no-optional-chain) identity spelling folds the receiver into a sequence with the
// collapsed static - the arg effect and the buried-global substitution both survive
let seqEff = 0;
export const viaIdentitySeqStatic = ((x) => x)((seqEff++, globalThis)).Array.of(26);
