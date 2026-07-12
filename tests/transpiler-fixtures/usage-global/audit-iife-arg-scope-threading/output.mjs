import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.concat";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// an IIFE call-arg evaluates AT THE CALL SITE: the union and the meta resolve it in the
// OUTER scope. distinct method per row attributes each arm.
// param-default arm: the LIVE arg supersedes the dead default, and its reachable
// reassignment targets join the union
let R = Object;
if (globalThis.cond) R = Array;
export const viaDefaultArm = (({
  from
} = Map) => from)(R);

// a param SHADOWING the arg's name must not swallow the receiver (param-default arm)
export const viaShadowDefault = !function ({
  of
} = WeakMap, Array) {
  return of;
}(Array);

// same shadow through the no-default arm
export const viaShadowBare = !function ({
  fromAsync
}, Array) {
  return fromAsync;
}(Array);

// no call-arg: the default IS live - its own target resolves
export const viaLiveDefault = (({
  from
} = Iterator) => from)();

// an SE-wrapped arg peels for classification while the effect stays in place
export const viaSeArg = !function ({
  entries
}, Object) {
  return entries;
}((eff(), Object));

// a maybe-undefined arg is not a usable receiver - the default stays the union source
export const viaMaybeArg = (({
  groupBy
} = Map) => groupBy)(maybe);

// a proxy-global MEMBER arg resolves at the call site through the shadow too
export const viaMemberArg = !function ({
  resolve
}, Promise) {
  return resolve;
}(globalThis.Promise);

// the reachable-union of a reassigned outer binding flows through a SHADOWED AP arg:
// candidates resolve at the call site, so the shadow cannot swallow the union
let R2 = WeakSet;
if (globalThis.cond) R2 = Iterator;
export const viaShadowUnion = !function ({
  concat
} = Map, R2) {
  return concat;
}(R2);