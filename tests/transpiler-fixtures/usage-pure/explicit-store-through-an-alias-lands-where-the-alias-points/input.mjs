// an explicit store through an alias lands where the alias points, as a member write through it does: through
// an alias of an object this file does not own it hands the stored constructor out with its statics; through an
// alias of a container's slot it may replace what a read back of the slot finds, which stays native, and takes
// the entry carrying the statics, as any store under a member path does; through an alias of a container
// nothing reads it keeps the constructor's own entry
const lib = window.MyLib;
Object.assign(lib, { Kind: Promise });
const shelf = { inner: { C: Object } };
const into = shelf.inner;
Object.assign(into, { [k]: Map });
export const grouped = shelf.inner.C.groupBy([1], x => x);
const quiet = {};
const unread = quiet;
Object.assign(unread, { Pool: WeakMap });
