// an explicit store writes every chain its target lands on, as a member write does - an assignment's value,
// each arm of a selection, a sequence's tail, a slot of a literal spelled in place - so a static read back
// through the container owes the stored constructor's family
const first = { inner: { C: Object } };
let held;
Object.assign(held = first.inner, { C: Map });
export const grouped = first.inner.C.groupBy([1], x => x);
const second = { inner: { C: Object } };
const other = { C: Object };
Object.assign(flag ? second.inner : other, { C: Promise });
export const settled = second.inner.C.allSettled([]);
const third = { inner: { C: Object } };
Reflect.set((0, third.inner), 'C', Symbol);
export const registered = third.inner.C.for('a');
const fourth = { inner: { C: Object } };
Object.defineProperty([fourth.inner][0], 'C', { value: URL });
export const valid = fourth.inner.C.canParse('a:b');
