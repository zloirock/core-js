import _Map from "@core-js/pure/actual/map/constructor";
// A Flow declaration is erased; the runtime constructor still needs its polyfill.
type Map = number;
export const result = new _Map([[1, 2]]).size;