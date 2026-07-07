import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// an array-wrapper flatten discards every wrapper level, so effects buried BETWEEN the levels
// must all lift, in source order: the outer chain (`(outer(), [...])`) AND the element prefixes
// (`[(inner(), R)]`). the un-unwrapped descent lost the inner effect on one emitter and the
// silently-peeling shared walk lost the outer one on the other. one shape per line, distinct
// statics attribute a regressed form; the assignment-form host keeps the array as its own
// SE-carrier statement instead (both effects still run once, in order)
function outerEffect() {
  return 1;
}
function innerEffect() {
  return 2;
}
function midEffect() {
  return 3;
}
outerEffect();
innerEffect();
const from = _Array$from;
export const viaDouble = from([1]);
outerEffect();
midEffect();
innerEffect();
const of = _Array$of;
export const viaTriple = of(1, 2);
const keep = 1;
outerEffect();
innerEffect();
const groupBy = _Object$groupBy;
const keep2 = 2;
export const viaSplit = groupBy([keep, keep2], x => x);
let fromAsync;
outerEffect();
[(innerEffect(), _globalThis)];
fromAsync = _Array$fromAsync;
export const viaAssignment = fromAsync;