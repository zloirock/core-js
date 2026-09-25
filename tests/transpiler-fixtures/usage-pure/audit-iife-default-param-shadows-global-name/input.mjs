// IIFE with parameter default: the parameter shadows the free identifier in the body, so the call
// folds to the default's constructor, never to the global the parameter is named after
const out = ((Set = WeakMap) => Set)().getOrInsert(1, 2);
