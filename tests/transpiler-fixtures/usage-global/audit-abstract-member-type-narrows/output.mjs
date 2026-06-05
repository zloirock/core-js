import "core-js/modules/es.object.to-string";
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
import "core-js/modules/web.dom-collections.iterator";
// indexed-access into abstract class members (`Repo['cache']` / `Repo['load']`) resolves to each
// member's annotated type on BOTH parsers, so `.union` narrows to Set and `.getOrInsert` to Map -
// a cross-parser parity guard for abstract-member type resolution
abstract class Repo {
  abstract cache: Set<number>;
  abstract load(): Map<string, number>;
}
function use(x: Repo['cache'], f: Repo['load']) {
  x.union(new Set());
  f().getOrInsert('k', 0);
}