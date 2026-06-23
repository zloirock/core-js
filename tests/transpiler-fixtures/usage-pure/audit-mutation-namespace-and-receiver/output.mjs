import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// Mutation through an Object / Reflect namespace reached as a proxy-global member chain - direct
// (`globalThis.Reflect`, `self.Object`), aliased (`const g = globalThis; g.Reflect.set`) or hopped
// (`globalThis.self.Reflect.set`) - names the SAME global namespace, resolved through the canonical
// proxy-global member resolver, so the patch is detected and the static read routes through the ponyfill
// constructor. `Reflect.set(target, key, value, RECEIVER)` redirects the write to the receiver, the real
// mutation host. distinct statics pin which shape was detected.
_Reflect$set(_Map, "groupBy", patchA);
const r1 = _Map.groupBy(items, fn);
_Reflect$set({}, "try", patchB, _Promise);
const r2 = _Promise.try(fn);
_Object$assign(_Iterator, {
  from: patchC
});
const r3 = _Iterator.from(src);
const g = _globalThis;
_Reflect$set(_Promise, "any", patchD);
const r4 = _Promise.any(list);
_Reflect$set(_Promise, "all", patchE);
const r5 = _Promise.all(list);
export { r1, r2, r3, r4, r5 };