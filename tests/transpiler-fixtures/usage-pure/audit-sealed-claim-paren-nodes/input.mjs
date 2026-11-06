// the SAME sealed-claim family as its default-parser twins, parsed with parens as NODES. a predicate
// that switches on the node type owes both spellings one answer, and the whole family reached this
// dialect only through a probe until now: every defect below showed as a difference between the two.
// what may still differ here is the printer's redundant parens - never the import set.
let n = 0;
export const optionalClaimThroughSeal = (globalThis.window.self)?.Promise?.resolve(1);
export const twoOptionalsOneSeal = ((globalThis.window)).self?.Promise?.resolve(1);
export const optionalCallThroughSeal = (globalThis.window).self.Array?.of(5);
export const erasableHopUnderSeal = (globalThis.self).window?.Array.of(5);
export const sealedNavSeqPrefix = ((n++, globalThis.window)).self?.Array?.of(5);
// NEGATIVE: no seal - the collapse erases the whole navigation, as it does under either parser
export const unsealed = globalThis.window.self?.Promise?.resolve(1);
