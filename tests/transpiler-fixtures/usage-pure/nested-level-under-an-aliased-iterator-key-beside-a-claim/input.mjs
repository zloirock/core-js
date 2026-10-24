// A nested level under an iterator key spelled through an alias, beside an instance claim, reads like its
// dotted spelling in both emitters: the receiver memoizes once, the level destructures the helper result of
// the iterator method off the memo and the claim beside it dispatches on the same memo - no residual reads
// the iterator slot a second time.
const it = Symbol.iterator;
const { [it]: { next }, flat: f } = getArr();
export { next, f };
