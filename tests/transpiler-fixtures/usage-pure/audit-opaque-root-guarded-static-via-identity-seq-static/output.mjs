import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// the plain (no-optional-chain) identity spelling folds the receiver into a sequence with the
// collapsed static - the arg effect and the buried-global substitution both survive
let seqEff = 0;
export const viaIdentitySeqStatic = ((x => x)((seqEff++, _globalThis)), _Array$of)(26);