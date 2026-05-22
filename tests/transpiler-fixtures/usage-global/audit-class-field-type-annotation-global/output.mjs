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
// class-field type annotations (`x: Map<T>`, `accessor y: Set<T>`) carry the typeAnnotation
// on the field-level AST node, NOT on a nested function expression. visitor entries for
// PropertyDefinition / AccessorProperty must walk the field typeAnnotation directly -
// without that walk, the Map / Set polyfills are missed even though the same annotation
// on a function parameter would emit them. abstract variants tracked the same way since
// their declared types still signal runtime usage of the bound globals
class Container<T> {
  bag: Map<string, T>;
  accessor cache: Set<T>;
  constructor() {
    this.bag = new Map();
    this.cache = new Set();
  }
}
new Container<number>();