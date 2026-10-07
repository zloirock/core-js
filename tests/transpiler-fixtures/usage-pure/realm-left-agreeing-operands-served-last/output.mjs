import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
// A last operand the build serves settles an undecided selection as a bare name does: a probe on the left
// (`globalThis.window?.Map`, absent off-window) decides nothing, but every operand names `Map` and the last one
// always holds it, so a member or `in` read over the selection takes the static's pure entry. A pattern over the
// same selection keeps its per-branch literals.
const list = [1, 2];
export const viaMember = _Map$groupBy(list, x => x);
export const viaIn = true;
export const viaOwner = _Number$isInteger(1);
const {
  groupBy: viaPattern
} = (null == _globalThis.window ? void 0 : {
  groupBy: _Map$groupBy
}) ?? {
  groupBy: _Map$groupBy
};
export { viaPattern };