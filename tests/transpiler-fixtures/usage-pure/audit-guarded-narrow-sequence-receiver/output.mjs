import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a conditionally-swapped alias reads its statics through a RUNTIME ctor guard (the live value
// decides: the swapped ctor takes the pure static, anything else the raw read). a SEQUENCE prefix on
// the receiver is not a reason to lose that guard - it runs once, ahead of the test, exactly where
// the source runs it. kept inside the raw branch it ran only on the path the guard did not take
let M;
let n = 0;
let k = 0;
if (_globalThis) M = _Map;
export const plainReceiver = M === _Map ? _Map$groupBy : M.groupBy;
export const seqReceiver = (n++, M === _Map ? _Map$groupBy : M.groupBy);
export const seqReceiverCall = (n++, M === _Map ? _Map$groupBy : M.groupBy.bind(M))(new _Map([[1, 1]]), x => x);
// NEGATIVE: a side-effecting KEY stays raw - the guard's taken branch would skip the effect the
// source always evaluates
export const seqKeyEffect = (n++, M)[k++, 'groupBy'];
// the DESTRUCTURED spelling of the same read renders the same guard as the declarator's value -
// equivalent down to the throw, since the raw branch dereferences a nullish receiver exactly as the
// pattern would. left raw it read the static off the binding the emit had already swapped to the
// pure ctor, so the polyfill was `undefined` where native answers the method
export const destructured = (() => {
  const g = M === _Map ? _Map$groupBy : M.groupBy;
  return g;
})();
export const destructuredShorthand = (() => {
  const groupBy = M === _Map ? _Map$groupBy : M.groupBy;
  return groupBy;
})();
export const destructuredSeq = (() => {
  const g = (n++, M === _Map ? _Map$groupBy : M.groupBy);
  return g;
})();
// NEGATIVE: more than one property in the pattern - the split is not this render's business
export const destructuredPair = (() => {
  const {
    groupBy: g,
    get: h
  } = M;
  return [g, h];
})();
export { n, k };