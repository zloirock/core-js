import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
const viaMember = [...[[1]]][0];
_includesMaybeArray(viaMember).call(viaMember, 1);
export { viaMember };