import _Map from "@core-js/pure/actual/map/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// `declare const X` / `declare var X` are elided by tsc; references resolve to the global.
// scope tracker registers the binding regardless of `declare`, so the polyfill must filter
// the binding before treating it as shadow
declare const Map: any;
declare var WeakMap: any;
export const a = new _Map();
export const b = new _WeakMap();