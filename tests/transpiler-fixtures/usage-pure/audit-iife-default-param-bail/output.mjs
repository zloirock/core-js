import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// IIFE with parameter default: parameter shadows free identifier in body
const out = ((Set = _WeakMap) => Set)().getOrInsert(1, 2);