import _Array$of from "@core-js/pure/actual/array/of";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// the SAME sealed-claim family as its default-parser twins, parsed with parens as NODES. a predicate
// that switches on the node type owes both spellings one answer, and the whole family reached this
// dialect only through a probe until now: every defect below showed as a difference between the two.
// what may still differ here is the printer's redundant parens - never the import set.
let n = 0;
export const optionalClaimThroughSeal = _Promise$resolve(1);
export const twoOptionalsOneSeal = _Promise$resolve(1);
export const optionalCallThroughSeal = _Array$of(5);
export const erasableHopUnderSeal = _Array$of(5);
export const sealedNavSeqPrefix = (n++, _Array$of)(5);
// NEGATIVE: no seal - the collapse erases the whole navigation, as it does under either parser
export const unsealed = _Promise$resolve(1);