// a namespace written through a binding the container census publishes only where it stores a global with
// statics - a selection of a name and a value, or a binding a pattern takes off a container - reaches the
// named container, so a static read back loads the namespace's static: over a ternary, a logical, a call
// arm, and a pattern
const listed = { C: Object };
const either = flag ? listed : { C: Set };
either.C = Array;
export const copied = listed.C.from([1]);
const box = { C: Object };
const pick = box || { C: Set };
pick.C = Math;
export const truncated = box.C.trunc(1.5);
const held = { C: Object };
const made = flag ? held : make();
made.C = Reflect;
export const keys = held.C.ownKeys({});
const tree = { inner: { C: Object } };
const { inner: leaf } = tree;
leaf.C = Number;
export const whole = tree.inner.C.isInteger(1);
