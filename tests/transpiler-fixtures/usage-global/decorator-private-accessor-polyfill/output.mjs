import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
import "core-js/modules/web.dom-collections.iterator";
// stage-3 auto-accessor with private name + decorator + polyfillable initializer.
// Decorator may invoke `Symbol.metadata`; the initializer constructs a Map (polyfill
// needed pre-ES2015). Private accessor is scope-closed - external writes can't mutate
class C {
  @dec
  accessor #foo = new Map();
}