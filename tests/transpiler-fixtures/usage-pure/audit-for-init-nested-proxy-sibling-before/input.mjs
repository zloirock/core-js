// for-loop init where a nested proxy destructure is preceded by a sibling property:
// the rewrite must keep both sites independent.
for (let i = 0, { Array: { from } } = globalThis; i < 1; i++) from([i]);
