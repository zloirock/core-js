import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a namespace written through a binding the container census publishes only where it stores a global with
// statics - a selection of a name and a value, or a binding a pattern takes off a container - reaches the
// named container, so a static read back loads the namespace's static: over a ternary, a logical, a call
// arm, and a pattern
const listed = {
  C: Object
};
const either = flag ? listed : {
  C: Set
};
either.C = Array;
export const copied = listed.C.from([1]);
const box = {
  C: Object
};
const pick = box || {
  C: Set
};
pick.C = Math;
export const truncated = box.C.trunc(1.5);
const held = {
  C: Object
};
const made = flag ? held : make();
made.C = Reflect;
export const keys = held.C.ownKeys({});
const tree = {
  inner: {
    C: Object
  }
};
const {
  inner: leaf
} = tree;
leaf.C = Number;
export const whole = tree.inner.C.isInteger(1);