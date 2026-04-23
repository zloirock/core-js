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
// TS type annotations inside class method signatures (`m(x: Map): Set {}`) on babel exposed
// as ClassMethod nodes — distinct from FunctionExpression. visitor entry was missing, so
// annotation globals (Map, Set) were not reported. parity with unplugin's ESTree MethodDefinition
// wrapping a FunctionExpression (which the Function visitor already covers)
class Foo {
  m(x: Map<string, number>): Set<string> {
    return new Set();
  }
}