import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
const [viaTailSpread] = [...[[1]], ...wrapped];
_keysMaybeArray(viaTailSpread).call(viaTailSpread);
export { viaTailSpread };