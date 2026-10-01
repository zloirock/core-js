import _WeakMap from "@core-js/pure/actual/weak-map";
// IIFE with parameter default: the parameter shadows the free identifier in the body, so the call
// folds to the default's constructor, never to the global the parameter is named after
const out = _WeakMap.getOrInsert(1, 2);