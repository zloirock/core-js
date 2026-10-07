import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// In usage-global a `||` / `??` the build decides injects for its LEFT alone wherever the selection is
// held - an alias, a receiver - so the static only the dead right carries (`Object.groupBy`,
// `Array.from`) stays out - through a chain of such aliases too (`Q`, `C`: no `AggregateError`). An alias
// holding a selection the build leaves undecided (`W`) leaves the one over it undecided as well, though
// `W` is always truthy: the right keeps its modules (`Array.fromAsync`).
let held;
const M = Map ?? Object;
export const grouped = M.groupBy(list, key);
const I = Iterator || Array;
export const iterated = I.from(list);
const R = globalThis ?? fallbackRealm;
export const viaRealm = R.Array.of(1);
export const viaStoredNav = ((held = globalThis).self || fallbackRealm)?.Reflect.ownKeys(value);
const base = Promise;
const P = base ?? AggregateError;
export const throughAlias = P.withResolvers();
const Q = base ?? Iterator;
const C = Q ?? AggregateError;
export const throughChain = C.try(task);
const W = maybe || Map;
export const {
  fromAsync
} = W || Array;
export { held };