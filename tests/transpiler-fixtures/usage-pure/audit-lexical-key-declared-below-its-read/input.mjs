// a computed key bound by a `let` / `const` BELOW its read sits in the temporal dead zone there: the
// read throws instead of yielding a name, so nothing folds through it - the realm hop keeps its key
// and the static keeps its receiver. the negatives pin the boundary: a read DEFERRED past module
// init observes the initialized binding, and so does an ordinary declare-then-use.
export const tdzHop = delete globalThis.self[hopKey].probe;
export const tdzStatic = Array[fromKey]([1]);
export const { [ofKey]: tdzSlot } = Array;
export const tdzLet = Object[assignKey]({}, {});
const hopKey = 'window';
const fromKey = 'from';
const ofKey = 'of';
let assignKey = 'assign';

export function deferred() { return Promise[settledKey]([]); }
const settledKey = 'allSettled';

const entriesKey = 'fromEntries';
export const eager = Object[entriesKey]([]);
