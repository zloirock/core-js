// a nested pattern over an undecided selection of containers reads the slot of whichever arm ran, so
// every arm's slot takes the static of the constructor it holds - declared, assigned or passed to a
// parameter - and an arm whose constructor has no such static keeps its own.
// An arm that is no container remains the raw branch of the guard.
const { C: { groupBy } } = flag ? { C: Object } : { C: Map };
export const declared = () => groupBy([1], x => x);
let from;
({ C: { from } } = flag ? { C: Array } : { C: Iterator });
export const assigned = () => from([1]);
function read({ C: { of } }) { return of; }
export const passed = () => read(flag ? { C: (log(), Array) } : { C: Array });
const { C: { try: attempt } } = flag ? { C: Promise } : { C: Object };
export const ownless = () => attempt(() => 1);
const { C: { fromEntries } } = flag ? { C: Object } : user;
export const notContainer = () => fromEntries([]);
