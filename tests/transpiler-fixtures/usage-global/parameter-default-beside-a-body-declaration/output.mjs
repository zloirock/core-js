import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
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
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// a parameter list is its own lexical region: a default reads the OUTER name however the BODY
// redeclares it, so every row below still needs its module. one global per row - the import set is
// the whole observable here, and a shared name would let one row mask another's loss
export function withVar(x = new Map()) {
  var Map = 1;
  return [x, Map];
}
export function withLet(x = new Set()) {
  let Set = 1;
  return [x, Set];
}
export function withConst(x = new WeakMap()) {
  const WeakMap = 1;
  return [x, WeakMap];
}
export function withFunction(x = Promise.resolve(1)) {
  function Promise() {}
  return [x, Promise];
}
export function withClass(x = Symbol.iterator) {
  class Symbol {}
  return [x, Symbol];
}
export function withNestedVar(x = new WeakSet()) {
  {
    var WeakSet = 1;
  }
  return [x, WeakSet];
}