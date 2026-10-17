import _Map from "@core-js/pure/actual/map";
// Constructing a patched built-in uses the same ponyfill object as the patch.
_Map.getOrInsert = c6;
export const r8 = new _Map();