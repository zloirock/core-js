// a write through a binding a pattern takes off a container replaces the slot it lands on whatever it stores - a
// value no census names, a local class, an object literal, an imported binding - so a static read back through
// the container's path stays a read of that slot, while a pattern binding only read through leaves the
// literal's constructor to the read
import Imported from './imported.mjs';
const first = { inner: { C: Array } };
const { inner: hole } = first;
hole.C = userCtor;
export const copied = first.inner.C.from([1]);
class Local {
  static groupBy() {
    return null;
  }
}
const second = { inner: { C: Object } };
const { inner: held } = second;
held.C = Local;
export const grouped = second.inner.C.groupBy([2], x => x);
const third = { inner: { C: Object } };
const { inner: shaped } = third;
shaped.C = { groupBy: () => null };
export const sorted = third.inner.C.groupBy([3], x => x);
const fourth = { inner: { C: Array } };
const { inner: taken } = fourth;
taken.C = Imported;
export const listed = fourth.inner.C.from([2]);
const fifth = { inner: { C: Array } };
const { inner: read } = fifth;
export const kind = typeof read.C;
export const made = fifth.inner.C.of(1);
