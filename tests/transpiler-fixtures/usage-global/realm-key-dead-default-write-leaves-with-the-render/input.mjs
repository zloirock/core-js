// A write in a realm key's dead default reaches no later read, whichever render drops the default: a level
// anchored on the constructor's ponyfill, a level a rest beside it splits off. A consumed assignment's value keeps
// reading the realm itself, where pure installs nothing: its default stays, and so does the write in it, live
// on an engine lacking the global - in usage-global the build fills that slot, and the write dies there too.
let a = 'ab', b = 'cd', c = 'ef', concat;
const { WeakMap: { custom } = (a = [1], Set) } = globalThis;
const { Promise: { allSettled } = (b = [2], WeakSet), ...rest } = globalThis;
use(({ Iterator: { concat } = (c = [3], DOMException) } = globalThis));
export const reads = [a.flat(), b.findLast(Boolean), c.toReversed()];
export { custom, allSettled, rest, concat };
