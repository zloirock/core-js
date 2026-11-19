// A for-of assignment combines a static extraction with a native nested slot and rest.
// Splitting its host must visit only the live pattern and retain all bindings.
let from, at, rest;
for ({ Array: { from, k: { at }, ...rest } } of [globalThis]);
