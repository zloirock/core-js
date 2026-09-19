import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Array slots preserve known constructors read through the global object.
// Plain and optional navigation both resolve; each static has its own import.
const arraySlot = [_globalThis.Array];
export const viaPlain = _Array$of(1);
const mapSlot = [_Map];
export const viaOptional = _Map$groupBy([], value => value);