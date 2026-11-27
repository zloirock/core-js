import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
const [viaPresence = [1]] = [...[undefined]];
_toSortedMaybeArray(viaPresence).call(viaPresence);
_atMaybeArray(viaPresence).call(viaPresence, 0);
export { viaPresence };