import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A static is decided by its own entry, never by its constructor's: excluding a constructor only stops injecting
// it - the data subset still carries it - so a static read off the realm under its key loads its own module
// whatever default stands on the level, whatever spells the realm, in an assignment and beside a claimed sibling;
// a key with no static of its own reads the realm's slot alone (`of`: no `Array.of`). Under a parameter's default
// the level's own default stays live and loads what it reads (`read({})` reads `WeakSet`).
const {
  Map: {
    groupBy
  } = Set
} = globalThis;
const {
  Promise: {
    try: attempt
  } = DOMException
} = self;
const {
  Promise: {
    allSettled,
    prototype: {
      then
    }
  } = Reflect
} = globalThis;
let any;
({
  Promise: {
    any
  } = Error
} = globalThis);
const {
  Promise: {
    race
  } = Number,
  WeakMap: W
} = globalThis;
const {
  Promise: {
    withResolvers,
    of
  } = Array
} = globalThis;
export function read({
  Promise: {
    reject
  } = WeakSet
} = globalThis) {
  return reject;
}
export { groupBy, attempt, allSettled, then, any, race, W, withResolvers, of };