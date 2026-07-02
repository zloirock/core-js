// `declare const X` / `declare var X` are elided by tsc; references resolve to the global.
// scope tracker registers the binding regardless of `declare`, so the polyfill must filter
// the binding before treating it as shadow
declare const Map: any;
declare var WeakMap: any;
export const a = new Map();
export const b = new WeakMap();
