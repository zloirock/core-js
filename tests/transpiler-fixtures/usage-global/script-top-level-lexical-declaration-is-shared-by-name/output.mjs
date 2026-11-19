require("core-js/modules/es.symbol.constructor");
require("core-js/modules/es.symbol.description");
require("core-js/modules/es.symbol.iterator");
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.reflect.own-keys");
require("core-js/modules/es.aggregate-error.constructor");
require("core-js/modules/es.promise.constructor");
require("core-js/modules/es.promise.catch");
require("core-js/modules/es.promise.finally");
require("core-js/modules/es.promise.reject");
require("core-js/modules/es.promise.resolve");
require("core-js/modules/es.promise.all");
require("core-js/modules/es.promise.all-settled");
require("core-js/modules/es.promise.any");
require("core-js/modules/es.promise.race");
require("core-js/modules/es.promise.try");
require("core-js/modules/es.promise.with-resolvers");
require("core-js/modules/es.array.iterator");
require("core-js/modules/es.array.from");
require("core-js/modules/es.map.constructor");
require("core-js/modules/es.map.species");
require("core-js/modules/es.map.group-by");
require("core-js/modules/es.map.get-or-insert");
require("core-js/modules/es.map.get-or-insert-computed");
require("core-js/modules/es.set.constructor");
require("core-js/modules/es.set.species");
require("core-js/modules/es.set.difference");
require("core-js/modules/es.set.intersection");
require("core-js/modules/es.set.is-disjoint-from");
require("core-js/modules/es.set.is-subset-of");
require("core-js/modules/es.set.is-superset-of");
require("core-js/modules/es.set.symmetric-difference");
require("core-js/modules/es.set.union");
require("core-js/modules/es.string.iterator");
require("core-js/modules/es.weak-map.constructor");
require("core-js/modules/es.weak-map.get-or-insert");
require("core-js/modules/es.weak-map.get-or-insert-computed");
require("core-js/modules/es.weak-set.constructor");
require("core-js/modules/esnext.promise.all-keyed");
require("core-js/modules/esnext.promise.all-settled-keyed");
require("core-js/modules/web.dom-collections.iterator");
require("core-js/modules/web.self");
// a top-level `let`, `const` or `class` of a sloppy script that may run bare binds in the realm's shared lexical
// scope: another script reads it by name as it reads a top-level `var`, so a constructor it holds loads its whole
// static family. a `let` in a block or a loop head binds there and stays the file's own
let S = self.Set;
const M = Map;
class Q extends Promise {}
{
  let W = WeakMap;
  new W();
}
for (const X of [WeakSet]) new X();