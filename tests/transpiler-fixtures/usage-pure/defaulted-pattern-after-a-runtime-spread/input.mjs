// An unknown runtime spread can supply the pattern; it does not prove omission.
// Keep the Array default in its own arm and serve the actual instance generically.
Array.prototype[Symbol.iterator] = function* () { yield 'text'; };
export const result = (({ at } = [1]) => at.call('ok', 0))(...[]);
