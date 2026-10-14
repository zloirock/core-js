// A destructured read off a constructor's prototype is typed by the constructor's name, as its member
// spelling `Ctor.prototype.key` is - also where `new` names no instance: the abstract Iterator and
// AsyncIterator, and Object, whose `new` may yield any object. No spelling loads another family's method,
// and a free name that only rhymes with a constructor names no family.
const { map } = Iterator.prototype;
const { prototype: { filter } } = Iterator;
const { Iterator: { prototype: { flatMap } } } = globalThis;
let join;
({ prototype: { join } } = Iterator);
for (const { prototype: { find } } of [Iterator]) find;
const proto = Iterator.prototype;
const { includes } = proto;
const { prototype: { forEach } } = AsyncIterator;
const { toString } = Object.prototype;
const { at } = iterator.prototype;
export { map, filter, flatMap, join, includes, forEach, toString, at };
