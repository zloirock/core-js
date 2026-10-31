// Nested statics and plain declarators retain source order.
// The second static initializer keeps its prefix between the surrounding siblings.
const { Array: { from } } = globalThis, before = trackBefore(), { Object: { keys } } = (log('SE'), globalThis), after = trackAfter();
export { from, before, keys, after };
