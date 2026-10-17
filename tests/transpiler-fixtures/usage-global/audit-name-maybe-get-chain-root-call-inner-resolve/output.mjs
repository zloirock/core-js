import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
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
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// usage-global counterpart: the member-expression stays verbatim, so this locks that DETECTION resolves the
// polyfills THROUGH a proxy-global chain-root call - the `.name` MaybeFunction on each collapsed ctor, the
// inner proxy-global member chain (`globalThis.self` -> web.self), and the polyfillable member inside the
// call body (`[1].flat()` -> es.array.flat) plus a SEQUENCE-wrapped receiver - and injects every side-effect
// import. distinct ctor per line.
let n = 0;
const memberChain = (() => {
  n += 1;
  return globalThis.self;
})().window.Map.name;
const polyfillable = (() => {
  [1].flat();
  return globalThis;
})().self.Set.name;
const seqWrapped = (n += 10, (() => {
  n += 100;
  return globalThis;
})().self).Promise.name;
const control = (() => {
  n += 1000;
  return globalThis;
})().self.WeakMap.name;
export { memberChain, polyfillable, seqWrapped, control, n };