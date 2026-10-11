// a member read off a name that holds the realm (`const g = globalThis; g.Map`) is the global it names, so a
// constructor written that way through a selection of a name and a literal lands on the name's container, and
// one written through a member alias of a container leaves with it: either owes its family
const g = globalThis;
const box = { C: Object };
const either = flag ? box : { C: Set };
either.C = g.Map;
export const grouped = box.C.groupBy([1], x => x);
const nest = { inner: { C: Object } };
const inner = nest.inner;
inner.C = g.Promise;
use(nest);
