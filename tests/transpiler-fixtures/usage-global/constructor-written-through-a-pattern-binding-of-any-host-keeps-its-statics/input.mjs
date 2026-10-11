// a binding takes its slot off a container the same way whichever host destructures it, so a constructor
// written through it reaches a static read back through the container's path - an assignment pattern, an
// array pattern, a for-of head over a literal, a catch parameter of a thrown container, and a defaulted
// parameter
const holder = { inner: { C: Object } };
let alias;
({ inner: alias } = holder);
alias.C = Map;
export const grouped = holder.inner.C.groupBy([1], x => x);
const list = [{ C: Array }];
const [first] = list;
first.C = Promise;
export const settled = list[0].C.allSettled([]);
const nest = { inner: { C: Object } };
for (const { inner: each } of [nest]) each.C = Symbol;
export const registered = nest.inner.C.for('a');
const thrown = { inner: {} };
try {
  throw thrown;
} catch ({ inner: caught }) {
  caught.C = URL;
}
export const valid = thrown.inner.C.canParse('a:b');
const box = { inner: { C: Array } };
function fill({ inner: slot } = box) {
  slot.C = Iterator;
}
fill();
export const copied = box.inner.C.from([1]);
