import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a presence test over an alias the file writes again decides nothing where the write may reach the
// test: the alias may hold another value, null included, so both arms run - the writes and the reads
// they guard keep every value. an alias nothing writes again decides as the global it holds
export function either(value, legacy) {
  let P = Promise;
  if (legacy) P = null;
  if (!P || typeof value == 'string') return value.at(0);
}
let Impl = Promise;
Impl = options.Promise;
let Ctor = Object;
if (!Impl) Ctor = Map;
export const grouped = Ctor.groupBy([1], x => x);
let R = Reflect;
export function setR(next) {
  R = next;
}
const held = R;
export function viaAlias(value) {
  if (!held || typeof value == 'string') return value.flat();
}
const stable = Promise;
export function control(value) {
  if (!stable || typeof value == 'string') return value.slice(1);
}