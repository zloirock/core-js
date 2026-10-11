// a write through a binding holding a member path of a container - a member alias, a binding a pattern takes off
// it, a path off such an alias, the slot of a literal spelled in place - replaces the slot it lands on whatever it
// stores, so the constructor the literal held there is read back off the slot and keeps its statics; a member
// alias no write goes through leaves the literal's constructor to the read
const first = { inner: { C: Map } };
const member = first.inner;
member.C = Object;
export const byKey = first.inner.C.groupBy([1], x => x);
const second = { inner: { C: Promise } };
const { inner: taken } = second;
taken.C = userValue;
export const all = second.inner.C.allSettled([]);
const third = { inner: { deep: { C: Iterator } } };
const outer = third.inner;
const nested = outer.deep;
nested.C = userValue;
export const wrapped = third.inner.deep.C.from([1]);
const fourth = { C: URL };
const held = { slot: fourth }.slot;
held.C = userValue;
export const valid = fourth.C.canParse('a:b');
const fifth = { inner: { C: Symbol } };
const read = fifth.inner;
export const shared = fifth.inner.C.for(read ? 'a' : 'b');
