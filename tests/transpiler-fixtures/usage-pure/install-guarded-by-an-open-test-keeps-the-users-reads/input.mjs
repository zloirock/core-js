// a guard the build cannot decide - a check of the engine's own shape, a flag beside a presence test - runs
// its install as the engine answers, so the reads it decides by stay the user's, no part of the test folds,
// and the reads after the install read the user's slot. a read ahead of the install that decides nothing
// still takes the pure import
export const early = Promise.resolve(0);
if (!window.Promise || Promise.length !== 1) window.Promise = PromiseShim;
export const ready = Promise.resolve(1);
if (isBrowser && !window.Map) window.Map = MapShim;
export const cache = new Map();
