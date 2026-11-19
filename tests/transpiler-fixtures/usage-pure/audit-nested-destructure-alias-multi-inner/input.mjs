// Multiple statics under one nested constructor each receive their pure method.
// The shared receiver rewrite preserves every binding.
const { Array: { from, of } } = globalThis;
from([1]);
of(1, 2);
