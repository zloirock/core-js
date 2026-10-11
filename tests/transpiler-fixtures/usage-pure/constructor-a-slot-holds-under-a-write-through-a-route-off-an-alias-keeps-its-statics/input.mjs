// a write through a selection or a member path starting off a plain alias of a container lands on the container
// all the same - an arm holding the alias, a chain of selections ending at it, a path off it - so the constructor
// the literal held there keeps its statics, read back off the container or off the alias; a write under another
// key through such an arm leaves the literal's constructor to the read
const grouped = { C: Map };
const alias = grouped;
const spare = {};
const via = flag ? alias : spare;
via.C = userValue;
export const byKey = grouped.C.groupBy([1], x => x);
const settled = { C: Promise };
const named = settled;
const either = opener || named;
either.C = userValue;
export const all = named.C.allSettled([]);
const iterated = { inner: { C: Iterator } };
const same = iterated;
const member = same.inner;
member.C = userValue;
export const wrapped = iterated.inner.C.from([1]);
const parsed = { C: URL };
const tail = parsed;
const link = flag ? first : tail;
const head = flag ? second : link;
head.C = userValue;
export const valid = parsed.C.canParse('a:b');
const registry = { C: Symbol };
const known = registry;
const kept = {};
const elsewhere = flag ? known : kept;
elsewhere.D = userValue;
export const shared = registry.C.for('a');
