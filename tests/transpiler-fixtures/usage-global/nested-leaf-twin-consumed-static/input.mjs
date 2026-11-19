// An earlier static claim must not erase the surviving function-name read.
// Both leaves read the same realm constructor.
const { Array: { from, name } } = globalThis;
use(from, name);
