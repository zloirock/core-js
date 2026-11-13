import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A computed key with a known string value extracts the method from the actual receiver.
export const viaComputedKeyFolds = (_ref => {
  let aKey = _atMaybeArray(_ref);
  return aKey;
})([1, 2]);