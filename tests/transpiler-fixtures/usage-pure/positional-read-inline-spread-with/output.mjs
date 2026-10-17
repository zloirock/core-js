import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
const [viaPresent = [1]] = [...[[2]]];
_withMaybeArray(viaPresent).call(viaPresent, 0, 1);
export { viaPresent };