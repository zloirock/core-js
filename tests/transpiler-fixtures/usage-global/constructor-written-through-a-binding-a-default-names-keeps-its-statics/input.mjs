// a binding whose default is a container's path stands for that path where the default fires - a parameter's
// own default, one inside its pattern, a catch parameter's, a declarator pattern's - so a constructor written
// through it lands on the container, and a static read back through the path owes its family
const first = { inner: { C: Object } };
function fill(slot = first.inner) {
  slot.C = Map;
}
fill();
export const grouped = first.inner.C.groupBy([1], x => x);
const second = { inner: { C: Object } };
function put({ slot = second.inner } = {}) {
  slot.C = Promise;
}
put();
export const settled = second.inner.C.allSettled([]);
const third = { inner: { C: Object } };
try {
  throw {};
} catch ({ slot = third.inner }) {
  slot.C = Symbol;
}
export const registered = third.inner.C.for('a');
const fourth = { inner: { C: Object } };
const { slot = fourth.inner } = {};
slot.C = URL;
export const valid = fourth.inner.C.canParse('a:b');
