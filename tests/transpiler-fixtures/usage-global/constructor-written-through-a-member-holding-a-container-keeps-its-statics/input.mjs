// a member a container is stored into (`holder.v = box.inner`, or a pattern storing into the member) holds that
// container, so a constructor written through the member owes its family to a static read back through the
// container's own path
const box = { inner: { C: Object } };
const holder = {};
holder.v = box.inner;
holder.v.C = Map;
export const grouped = box.inner.C.groupBy([1], x => x);
const nest = { inner: { C: Object } };
const keeper = {};
({ inner: keeper.v } = nest);
keeper.v.C = Promise;
export const settled = nest.inner.C.allSettled([]);
