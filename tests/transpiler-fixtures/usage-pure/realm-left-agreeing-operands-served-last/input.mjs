// A last operand the build serves settles an undecided selection as a bare name does: a probe on the left
// (`globalThis.window?.Map`, absent off-window) decides nothing, but every operand names `Map` and the last one
// always holds it, so a member or `in` read over the selection takes the static's pure entry. A pattern over the
// same selection keeps its per-branch literals.
const list = [1, 2];
export const viaMember = (globalThis.window?.Map ?? globalThis.Map).groupBy(list, x => x);
export const viaIn = 'groupBy' in (globalThis.window?.Map ?? globalThis.Map);
export const viaOwner = (globalThis.window?.Number || globalThis.Number).isInteger(1);
const { groupBy: viaPattern } = globalThis.window?.Map ?? globalThis.Map;
export { viaPattern };
