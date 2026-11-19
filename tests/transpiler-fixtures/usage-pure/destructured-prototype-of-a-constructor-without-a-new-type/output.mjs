import _at from "@core-js/pure/actual/instance/at";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
// A destructured read off a constructor's prototype is typed by the constructor's name, as its member
// spelling `Ctor.prototype.key` is - also where `new` names no instance: the abstract Iterator and
// AsyncIterator, and Object, whose `new` may yield any object. No spelling loads another family's method,
// and a free name that only rhymes with a constructor names no family.
const {
  map
} = _Iterator.prototype;
const {
  prototype: {
    filter
  }
} = _Iterator;
const {
  prototype: {
    flatMap
  }
} = _Iterator;
let join;
({
  prototype: {
    join
  }
} = _Iterator);
for (const {
  prototype: {
    find
  }
} of [_Iterator]) find;
const proto = _Iterator.prototype;
const {
  includes
} = proto;
const {
  prototype: {
    forEach
  }
} = AsyncIterator;
const {
  toString
} = Object.prototype;
const at = _at(iterator.prototype);
export { map, filter, flatMap, join, includes, forEach, toString, at };