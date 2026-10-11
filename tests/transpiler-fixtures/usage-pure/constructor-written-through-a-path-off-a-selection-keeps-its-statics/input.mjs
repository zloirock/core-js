// a constructor written through an alias of a member path off a selection of containers lands on the slot
// under that path in whichever container the selection holds, so a static read back through the path of one
// reaches the written constructor's static, and pure takes the entry carrying it
const first = { inner: { C: Object } };
const second = { inner: { C: Array } };
const picked = flag ? first : second;
const held = picked.inner;
held.C = Map;
export const grouped = first.inner.C.groupBy([1], x => x);
