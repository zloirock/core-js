// a binding whose default is a container's path stands for that path where the default fires - a parameter's
// own default, one inside its pattern, a catch parameter's - so a constructor written through it lands on the
// container, and a static read back through the path is no longer the literal's to fold
const first = { inner: { C: Object } };
function fill(slot = first.inner) {
  slot.C = Map;
}
fill();
export const grouped = first.inner.C.groupBy([1], x => x);
const second = { inner: { C: Array } };
function put({ slot = second.inner } = {}) {
  slot.C = Iterator;
}
put();
export const copied = second.inner.C.from([1]);
const third = { inner: { C: Object } };
try {
  throw {};
} catch ({ slot = third.inner }) {
  slot.C = Reflect;
}
export const caught = third.inner.C.getPrototypeOf(x);
