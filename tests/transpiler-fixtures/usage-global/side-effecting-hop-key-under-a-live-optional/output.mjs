import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
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
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// a proxy-global HOP KEY carrying a side effect, read under a LIVE `?.`: the guard test is the kept
// source of the hop that owns the key, so it already evaluates that effect - re-emitting it ahead of
// the alternate would run it twice where native runs it once. a key ABOVE the guarded hop is the
// boundary: the test never reaches it, so that one DOES belong to the alternate
let log = [];
function eff(t) {
  log.push(t);
  return t;
}
const plainRoot = globalThis[eff('a'), 'window']?.self.Array;
const g = globalThis;
const aliasRoot = g[eff('b'), 'window']?.self.Map;
const aboveTheGuard = globalThis.window?.[eff('c'), 'self'].Set;
const bothSides = globalThis[eff('d'), 'window']?.[eff('e'), 'self'].Promise;
export { log, plainRoot, aliasRoot, aboveTheGuard, bothSides };