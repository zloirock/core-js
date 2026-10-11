// a constructor an explicit store puts through an alias - a selection of names, a member path, a selection
// of a name and a value - lands where a plain write through it does, so a static read back through the
// container reaches the stored constructor's static: the store is filed before the alias classes are drawn
const listed = { C: Array };
const other = { C: Object };
const either = flag ? listed : other;
Object.assign(either, { C: Iterator });
export const copied = listed.C.from([1]);
const box = { inner: { C: Object } };
const alias = box.inner;
Reflect.set(alias, 'C', Map);
export const grouped = box.inner.C.groupBy([1], x => x);
const held = { C: Array };
const mixed = flag ? held : { C: Set };
Object.defineProperty(mixed, 'C', { value: Promise });
export const settled = held.C.allSettled([]);
