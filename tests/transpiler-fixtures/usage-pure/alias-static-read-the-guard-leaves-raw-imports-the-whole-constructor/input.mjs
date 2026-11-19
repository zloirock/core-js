// Optional calls and optional members of a selected constructor use an identity guard.
// An effectful key stays raw and requires the whole constructor; guarded reads keep narrow entries.
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
