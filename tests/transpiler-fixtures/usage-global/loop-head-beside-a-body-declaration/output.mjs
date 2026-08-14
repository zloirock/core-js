import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.is-finite";
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
import "core-js/modules/web.dom-collections.iterator";
// a loop HEAD is its own lexical region - the body's `let` does not cover it, so every head here
// reads the OUTER binding and must be injected. one global per position so a dropped position is
// visible in the import set rather than hidden behind a sibling's. the last two loops are the
// controls, each on a global no head above uses so its absence is visible. first: a use IN the body
// is really shadowed by the body's `let`. second: a body `var` hoists its BINDING (not its
// assignment) to the enclosing scope, so the head reads that local while it still holds `undefined`
// and throws - there is no global read to serve in EITHER method, which is why the import set stays
// clean for a reason stronger than usage-global's over-inject bias
const src = {
  a: 1
};
function use() {/* empty */}
for (let i = new Map(); false;) {
  let Map = 1;
  use(Map, i);
}
for (let i = 0; i < new Set().size;) {
  let Set = 1;
  use(Set, i);
}
for (let i = 0; false; Array.from([1])) {
  let Array = 1;
  use(Array, i);
}
for (const value of Object.values(src)) {
  let Object = 1;
  use(Object, value);
}
for (const key in Promise) {
  let Promise = 1;
  use(Promise, key);
}
while (Number.isFinite(0) && false) {
  let Number = 1;
  use(Number);
}
do {
  let WeakMap = 1;
  use(WeakMap);
} while (new WeakMap() && false);
for (let i = 0; i < 0; i++) {
  let WeakSet = 1;
  use(new WeakSet(), i);
}
for (let i = Reflect.ownKeys(src); false;) {
  var Reflect = 1;
  use(Reflect, i);
}
export const done = true;