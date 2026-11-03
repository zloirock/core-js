// A for-of assignment reads a nested static alongside a native nested slot and rest.
// Global injection must leave the assignment pattern intact.
let from, at, rest;
for ({ Array: { from, k: { at }, ...rest } } of [globalThis]);
