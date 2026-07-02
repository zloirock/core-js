// Baseline: `new Map()` direct - getOrInsert should polyfill via precise dispatch.
const m = new Map();
m.getOrInsert(1, 2);
