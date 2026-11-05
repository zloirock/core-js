// An iterator read on the realm keeps its fallback when the method is absent.
// Pure dispatch reads the polyfilled realm; global mode retains the native pattern.
const { [Symbol.iterator]: iterator = fallback() } = globalThis;
use(iterator);
