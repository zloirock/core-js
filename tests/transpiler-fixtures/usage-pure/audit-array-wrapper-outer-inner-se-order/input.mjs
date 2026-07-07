// an array-wrapper flatten discards every wrapper level, so effects buried BETWEEN the levels
// must all lift, in source order: the outer chain (`(outer(), [...])`) AND the element prefixes
// (`[(inner(), R)]`). the un-unwrapped descent lost the inner effect on one emitter and the
// silently-peeling shared walk lost the outer one on the other. one shape per line, distinct
// statics attribute a regressed form; the assignment-form host keeps the array as its own
// SE-carrier statement instead (both effects still run once, in order)
function outerEffect() { return 1; }
function innerEffect() { return 2; }
function midEffect() { return 3; }
const [{ Array: { from } }] = (outerEffect(), [(innerEffect(), globalThis)]);
export const viaDouble = from([1]);
const [[{ Array: { of } }]] = (outerEffect(), [(midEffect(), [(innerEffect(), globalThis)])]);
export const viaTriple = of(1, 2);
const keep = 1, [{ Object: { groupBy } }] = (outerEffect(), [(innerEffect(), globalThis)]), keep2 = 2;
export const viaSplit = groupBy([keep, keep2], x => x);
let fromAsync;
[{ Array: { fromAsync } }] = (outerEffect(), [(innerEffect(), globalThis)]);
export const viaAssignment = fromAsync;
