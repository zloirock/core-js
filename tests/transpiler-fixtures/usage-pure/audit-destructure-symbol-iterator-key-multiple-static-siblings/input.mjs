// A `[Symbol.iterator]` key beside several claimed statics and an object rest stays in the residual,
// keyed by the symbol's ponyfill, while each static extracts ahead of it in source order and stays
// excluded from the rest.
const { [Symbol.iterator]: it, from, of, ...rest } = globalThis.Array;
it;
from([1]);
of(2, 3);
export { it, from, of, rest };
