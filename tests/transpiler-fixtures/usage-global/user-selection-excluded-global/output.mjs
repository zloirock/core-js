import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// In usage-global a presence test over a global the targets need and a filter drops (`Promise`, excluded
// here) decides nothing, nor does a `||` reading it off the realm: every operand - read through an alias,
// a receiver, a destructure or a `||` the alias holds - injects its own family. Its bare name decides, an
// engine lacking it throwing first, as a served global (`Map`) does; a dead arm injects nothing.
const P = typeof Promise !== 'undefined' ? Promise : MyPromise;
export const viaAlias = P.withResolvers();
export const viaReceiver = (typeof Promise !== 'undefined' ? Promise : MyPromise).try(task);
const C = typeof Promise !== 'undefined' ? Promise : Array;
export const viaKnownArm = C.from([1]);
export const {
  fromAsync
} = typeof Promise !== 'undefined' ? Promise : Array;
const Q = Promise || Array;
export const viaFallback = Q.of(1);
const M = typeof Map !== 'undefined' ? Map : Object;
export const served = M.groupBy(list, key);
const R = globalThis.Promise || Object;
export const viaRealmFallback = R.fromEntries(pairs);