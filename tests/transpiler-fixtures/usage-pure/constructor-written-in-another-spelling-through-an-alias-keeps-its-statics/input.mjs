// a constructor written through an alias in another spelling of its name - an alias of the constructor, a
// read off the global object, a selection or a logical of constructors - is read through the value canon,
// so the alias stores it as a bare reference does and a static read back through the container reaches it
const listed = { C: Array };
const other = { C: Object };
const either = flag ? listed : other;
const I = Iterator;
either.C = I;
export const copied = listed.C.from([1]);
const box = { inner: { C: Object } };
const alias = box.inner;
alias.C = globalThis.Map;
export const grouped = box.inner.C.groupBy([1], x => x);
const held = { C: Array };
const mixed = flag ? held : { C: Set };
mixed.C = flag2 ? Promise : Promise;
export const settled = held.C.allSettled([]);
const tree = { C: Object };
const pick = tree || { C: Set };
pick.C = Symbol || Symbol;
export const registered = tree.C.for('a');
