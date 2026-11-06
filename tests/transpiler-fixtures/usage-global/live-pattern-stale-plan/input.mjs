// A direct constructor, nested static and rest share one declaration.
// Global injection preserves the pattern and supplies both builtin families.
const { Map, Array: { from }, ...rest } = globalThis;
use(Map, from, rest);
