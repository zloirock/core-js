import _at from "@core-js/pure/actual/instance/at";
// A surviving array element shares its receiver with the extraction.
// A member or selection needs one memo; a stable binding can be read again.
const _ref = holder.inner;
const viaGetter = _at(_ref);
const [{}, keepA] = [_ref, 1];
const _ref2 = cond ? left : right;
const viaSelection = _at(_ref2);
const [{}, keepB] = [_ref2, 2];
const viaBinding = _at(arr);
const [{}, keepC] = [arr, 3];
export { viaGetter, keepA, viaSelection, keepB, viaBinding, keepC };