// a reassigned constructor alias reads its statics through a runtime identity guard; a read the guard
// leaves raw (an optional call over it, a call through its own `?.`, a key that runs code) reads the
// static off the swapped binding, so the alias imports the whole constructor - one constructor per row.
// a read the guard serves keeps the narrow entry
class Shim {}
let M = Map;
if (globalThis.c) M = Shim;
export const grouped = M.groupBy?.([1, 2], x => x % 2);
let P = Promise;
if (globalThis.c) P = Shim;
export const resolvers = P?.withResolvers();
let I = Iterator;
if (globalThis.c) I = Shim;
let n = 0;
export const iterated = I[(n++, 'from')]([1]);
let U = URL;
if (globalThis.c) U = Shim;
export const parsable = U.canParse('x:');
