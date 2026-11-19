globalThis.Array.from = replacement;
use(globalThis.Array.from([7]));
const { Array: { from } } = globalThis;
use(from);
