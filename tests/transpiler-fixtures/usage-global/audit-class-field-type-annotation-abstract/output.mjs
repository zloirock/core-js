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
// abstract class fields carry the same typeAnnotation slot as concrete ones, but their
// declaration has no runtime body / initializer. visitor must still walk the annotation
// so Map / Set polyfills are emitted - the declared type signals the subclass will need
// the bound globals at runtime even though the abstract member itself never executes
abstract class C<T> {
  abstract bag: Map<string, T>;
  abstract accessor cache: Set<T>;
}
new class extends C<number> {
  bag = new Map();
  cache = new Set();
}();