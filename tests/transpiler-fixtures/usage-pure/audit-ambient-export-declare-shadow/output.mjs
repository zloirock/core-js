import _Map from "@core-js/pure/actual/map/constructor";
// `declare const Map: ...` parent-declared ambient binding. isAmbientBindingShape
// covers `declare var X` / `declare const X` via parent.declare === true. Map reference
// here resolves to global, polyfill should fire
declare const Map: any;
const m = new _Map();
m.has(1);