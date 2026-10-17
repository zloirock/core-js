import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
const [viaPresence = [1]] = [...[undefined]];
_toSortedMaybeArray(viaPresence).call(viaPresence);
export { viaPresence };