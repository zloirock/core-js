// for-loop init with a single nested proxy destructure (no siblings): the rewrite
// still threads through the nested proxy correctly.
for (const { Array: { from } } = globalThis; from([0]).length;) break;
