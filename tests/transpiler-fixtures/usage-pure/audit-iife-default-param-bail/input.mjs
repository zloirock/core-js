// IIFE with parameter default: parameter shadows free identifier in body
const out = ((Set = WeakMap) => Set)().getOrInsert(1, 2);
