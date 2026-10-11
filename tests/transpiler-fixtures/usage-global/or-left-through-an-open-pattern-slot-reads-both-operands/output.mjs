import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-descriptors";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.values";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
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
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.entries";
import "core-js/modules/web.dom-collections.values";
// a `||` / `??` or a presence test whose left reads a name a pattern binds to a slot holding no one certain
// value - one a write replaced or a call it escapes to may replace, one a spread may shift, one of a
// container a write may replace, and an alias of such a name - decides nothing: the slot may hold a falsy
// value, so the right is read too. a slot captured before its write, and one nothing writes, decide
const box = {
  C: Map
};
box.C = null;
const {
  C: M
} = box;
export const grouped = (M || Object).groupBy;
const held = {
  C: Set
};
clobber(held);
const {
  C: S
} = held;
export const built = (S ?? Object).fromEntries;
const slots = [WeakMap];
slots[0] = null;
const [W] = slots;
export const owns = (typeof W == 'function' ? W : Object).hasOwn;
const [, P] = [...extra, Promise];
export const listed = (P || Object).values;
let pair = {
  C: WeakSet
};
if (flag) pair = {
  C: null
};
const {
  C: Q
} = pair;
export const pairs = (Q || Object).entries;
const N = M;
export const described = (N || Object).getOwnPropertyDescriptors;
const late = {
  C: Map
};
const {
  C: L
} = late;
late.C = null;
export const merged = (L || Object).assign;
const plain = {
  C: Set
};
const {
  C: K
} = plain;
export const same = (K || Object).is;