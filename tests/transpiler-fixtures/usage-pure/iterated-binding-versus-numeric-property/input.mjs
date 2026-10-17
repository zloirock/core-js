// An ArrayPattern consumes the current iterator. A numeric ObjectPattern key
// reads an indexed property and retains its independent Array family.
Array.prototype[Symbol.iterator] = function* () { yield 'text'; };
const [value] = [[1]];
export const iterated = value.at(0);
const { 0: indexed } = [[1]];
export const property = indexed.includes(1);
