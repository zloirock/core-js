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
class Uses {
  // `var X = X` self-refs the GLOBAL on the RHS (the hoisted var is undefined until the initializer
  // runs); the decorator's inline function gets a dedicated estree FRAME scope whose binding must
  // surface KIND `var` so the self-ref-var guard fires and keeps the read on the global. a CONSTRUCTOR
  // read is what exposes the miss (a bare method call over-injects regardless): a null-kind binding
  // treated `var Map` as a real shadow and dropped the whole Map polyfill.
  @first(function () {
    var Map = Map;
    return new Map([[1, 2]]);
  })
  a() {}

  // `let`/`const` are real block-scoped shadows (their RHS sits in the TDZ), NOT self-ref vars - the
  // local constructor stays the user binding, so no polyfill is injected for it.
  @second(function () {
    let Set = Set;
    return new Set([1]);
  })
  b() {}
}
export { Uses };