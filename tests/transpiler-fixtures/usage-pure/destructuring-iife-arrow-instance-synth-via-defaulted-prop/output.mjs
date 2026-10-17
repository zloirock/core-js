import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
export const viaDefaultedProp = (({
  copyWithin = null
}) => copyWithin)({
  copyWithin: _copyWithinMaybeArray([1, 2])
});