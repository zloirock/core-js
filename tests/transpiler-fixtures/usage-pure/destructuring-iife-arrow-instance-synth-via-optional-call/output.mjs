import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
export const viaOptionalCall = ((_ref, _unused = void 0) => {
  let keys = _keysMaybeArray(_ref);
  return keys;
})?.([1, 2]);