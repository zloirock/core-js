import _at from "@core-js/pure/actual/instance/at";
const _ref = holder.inner;
const viaGetter = _at(_ref);
// an array-wrapped instance claim beside a BOUND neighbour keeps the wrapper alive, and that residual
// coerces the element a second time - so an element a residual cannot re-read for free memoizes into
// one ref both readers share: a member whose getter would fire twice, a selection that would
// re-select. a bare binding reads twice for free and needs none
const [{}, keepA] = [_ref, 1];
const _ref2 = cond ? left : right;
const viaSelection = _at(_ref2);
const [{}, keepB] = [_ref2, 2];
const viaBinding = _at(arr);
const [{}, keepC] = [arr, 3];
export { viaGetter, keepA, viaSelection, keepB, viaBinding, keepC };