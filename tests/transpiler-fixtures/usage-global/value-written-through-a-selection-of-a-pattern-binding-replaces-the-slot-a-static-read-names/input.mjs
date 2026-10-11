// a write through a selection holding a binding a pattern takes off a container lands on the container's path
// whatever it stores, so a static read back through the path stays a read of that slot: the constructor the
// literal held keeps its statics, and a static owner with no constructor entry is no longer served by name; a
// selection of such a binding no write goes through leaves the literal's static to the read
const first = { inner: { C: Map } };
const { inner: taken } = first;
const spare = {};
const via = flag ? taken : spare;
via.C = userValue;
export const byKey = first.inner.C.groupBy([1], x => x);
const second = { inner: { C: Object } };
const { inner: held } = second;
const either = opener || held;
either.C = userValue;
export const entries = second.inner.C.fromEntries([]);
const third = { inner: { C: Promise } };
const { inner: kept } = third;
const other = {};
const unused = flag ? kept : other;
export const all = third.inner.C.allSettled([]);
