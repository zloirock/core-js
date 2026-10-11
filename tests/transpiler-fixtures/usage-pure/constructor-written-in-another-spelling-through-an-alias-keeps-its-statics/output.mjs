import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol";
// a constructor written through an alias in another spelling of its name - an alias of the constructor, a
// read off the global object, a selection or a logical of constructors - is read through the value canon,
// so the alias stores it as a bare reference does and a static read back through the container reaches it
const listed = {
  C: Array
};
const other = {
  C: Object
};
const either = flag ? listed : other;
const I = _Iterator;
either.C = I;
export const copied = listed.C.from([1]);
const box = {
  inner: {
    C: Object
  }
};
const alias = box.inner;
alias.C = _Map;
export const grouped = box.inner.C.groupBy([1], x => x);
const held = {
  C: Array
};
const mixed = flag ? held : {
  C: _Set
};
mixed.C = flag2 ? _Promise : _Promise;
export const settled = held.C.allSettled([]);
const tree = {
  C: Object
};
const pick = tree || {
  C: _Set
};
pick.C = _Symbol;
export const registered = tree.C.for('a');