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
// on the field-level AST node (PropertyDefinition / AccessorProperty), NOT on a nested
// function expression, so the field annotation must be walked directly - otherwise the
// Map / Set polyfills are missed. abstract fields track the same way (their types still signal usage).
class Container<T> {
  bag: Map<string, T>;
  accessor cache: Set<T>;
  constructor() {
    this.bag = new Map();
    this.cache = new Set();
  }
}
new Container<number>();