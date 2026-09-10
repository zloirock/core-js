// a sequence buried at a proven call root rides INSIDE the guard test, spelled exactly once:
// the delete flavor re-hangs the member outside behind its own `?.`, the read flavor folds
// the tail into the alternate, and a claim inside the prefix stays live where it stands.
// an IDENT root under the same prefix renders the guard its CALL-rooted twin does: the prefix is
// what the root claim's own substitution lands inside, so the hops above it are not that claim's to
// fold - standing down for it left `self` a raw realm read, the one hop here with a pure entry
let seqE = 0;
const arr = [1, 2, 3];
const utRoot = () => globalThis;
export const deletedSeqPrefixCallRoot = delete (seqE++, utRoot())?.window?.self?.customQ;
export const readSeqPrefixCallRoot = (seqE++, utRoot())?.window?.self?.customQ;
export const claimInSeqPrefix = delete (arr.at(0), utRoot())?.window?.self?.customQ;
export const deletedSeqPrefixIdentRoot = delete (seqE++, globalThis)?.window?.self?.customQ;
export { seqE };
