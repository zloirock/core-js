import _Map from "@core-js/pure/actual/map";
// A nested realm destructure observes a later write to its selected static.
const {
  set: setAlias
} = _Map;
_Map.set = setPatch;
export const r9 = setAlias;