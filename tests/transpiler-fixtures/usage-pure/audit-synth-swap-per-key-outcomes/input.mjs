// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const { foo } = globalThis.Array;

const { from } = globalThis.Array;

const { of, bar } = globalThis.Array;

const { groupBy, ...rest } = globalThis.Map;

export function g({ at, ...r } = 'ab') { return [at, r]; }

export const a = [foo, from, of, bar, groupBy, rest];
