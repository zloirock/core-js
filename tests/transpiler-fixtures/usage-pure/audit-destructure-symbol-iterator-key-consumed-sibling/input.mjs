// A `[Symbol.iterator]` key beside a claimed static and an object rest stays in the residual, keyed
// by the symbol's ponyfill and excluded from the rest, while the static extracts ahead of it.
const { [Symbol.iterator]: it, from, ...rest } = globalThis.Array;
it;
from([1]);
export { it, from, rest };
