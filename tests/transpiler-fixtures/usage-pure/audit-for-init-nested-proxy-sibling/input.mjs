// for-loop init with a nested proxy destructure plus a sibling property: each must
// produce its own polyfill alias.
for (const { Array: { from } } = globalThis, i = 0; i < 1; i++) from([i]);
