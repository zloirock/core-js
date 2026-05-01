import _Map from "@core-js/pure/actual/map/constructor";
// Baseline: `new Map()` direct - getOrInsert should polyfill via precise dispatch.
const m = new _Map();
m.getOrInsert(1, 2);