// Array patterns consume the runtime iterator before deciding a slot default.
// An empty literal does not prove absence after a visible iterator replacement.
Array.prototype[Symbol.iterator] = function* () { yield 'xy'; };
const [value = [1]] = [];
export const result = value.includes('xy');
