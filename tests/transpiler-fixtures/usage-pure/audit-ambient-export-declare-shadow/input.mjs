// `declare const Map: ...` parent-declared ambient binding. ambient binding filter
// covers `declare var X` / `declare const X` via parent.declare === true. Map reference
// here resolves to global, polyfill should fire
declare const Map: any;
const m = new Map();
m.has(1);
