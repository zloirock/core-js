import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
// a global's own value written back into its slot through a realm member - from the bare name, from another
// realm name, from the same member - puts the whole entry into the slot, and a static's own value written back
// into the static puts the static's polyfill there
_globalThis.Map = _Map;
_self.Set = _Set;
window.WeakMap = _WeakMap;
Array.from = _Array$from;
export const grouped = Map.groupBy([1, 2, 3], x => x % 2).get(1);
export const sized = new Set([1, 1]).size;
export const weak = new WeakMap([[grouped, 1]]).has(grouped);
export const listed = Array.from('ab');