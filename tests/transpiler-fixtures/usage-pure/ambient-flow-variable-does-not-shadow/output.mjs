import _Map from "@core-js/pure/actual/map/constructor";
// A Flow declaration is erased; the runtime constructor still needs its polyfill.
declare var Map: any;
export const result = new _Map([[1, 2]]).size;