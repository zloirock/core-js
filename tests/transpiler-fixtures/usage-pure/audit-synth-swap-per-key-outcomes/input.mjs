// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
const { foo } = globalThis.Array;

const { from } = globalThis.Array;

const { of, bar } = globalThis.Array;

const { groupBy, ...rest } = globalThis.Map;

export function g({ at, ...r } = 'ab') { return [at, r]; }

export const a = [foo, from, of, bar, groupBy, rest];
