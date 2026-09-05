// an array-wrapped instance claim beside a BOUND neighbour keeps the wrapper alive, and that residual
// coerces the element a second time - so an element a residual cannot re-read for free memoizes into
// one ref both readers share: a member whose getter would fire twice, a selection that would
// re-select. a bare binding reads twice for free and needs none
const [{ at: viaGetter }, keepA] = [holder.inner, 1];
const [{ at: viaSelection }, keepB] = [cond ? left : right, 2];
const [{ at: viaBinding }, keepC] = [arr, 3];
export { viaGetter, keepA, viaSelection, keepB, viaBinding, keepC };
