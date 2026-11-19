import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
// `in` folds to a constant only while its right operand cannot be the undefined that `in` THROWS on.
const src = [3, [1, 2]];
export const plainCallReceiver = (_sliceMaybeArray(src).call(src), true);