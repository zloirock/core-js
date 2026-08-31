// a sequence buried at a proven call root rides INSIDE the guard test, spelled exactly once:
// the delete flavor re-hangs the member outside behind its own `?.`, the read flavor folds
// the tail into the alternate, and a claim inside the prefix stays live where it stands.
// an IDENT root under the same prefix is the fold twin - no keeping guard, the run folds whole
let seqE = 0;
const arr = [1, 2, 3];
const utRoot = () => globalThis;
export const deletedSeqPrefixCallRoot = delete (seqE++, utRoot())?.window?.self?.customQ;
export const readSeqPrefixCallRoot = (seqE++, utRoot())?.window?.self?.customQ;
export const claimInSeqPrefix = delete (arr.at(0), utRoot())?.window?.self?.customQ;
export const deletedSeqPrefixIdentRoot = delete (seqE++, globalThis)?.window?.self?.customQ;
export { seqE };
