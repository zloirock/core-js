import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Promise from "@core-js/pure/actual/promise";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
import _Set from "@core-js/pure/actual/set/constructor";
// a constructor an explicit store puts through an alias - a selection of names, a member path, a selection
// of a name and a value - lands where a plain write through it does, so a static read back through the
// container reaches the stored constructor's static: the store is filed before the alias classes are drawn
const listed = {
  C: Array
};
const other = {
  C: Object
};
const either = flag ? listed : other;
_Object$assign(either, {
  C: _Iterator
});
export const copied = listed.C.from([1]);
const box = {
  inner: {
    C: Object
  }
};
const alias = box.inner;
_Reflect$set(alias, 'C', _Map);
export const grouped = box.inner.C.groupBy([1], x => x);
const held = {
  C: Array
};
const mixed = flag ? held : {
  C: _Set
};
Object.defineProperty(mixed, 'C', {
  value: _Promise
});
export const settled = held.C.allSettled([]);