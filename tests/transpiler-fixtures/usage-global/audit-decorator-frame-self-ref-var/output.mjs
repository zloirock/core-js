import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
import "core-js/modules/web.dom-collections.iterator";
class Uses {
  // a `var X = X` inside a decorator's inline FUNCTION binds afresh in that frame and hoists to
  // `undefined`, so the initializer reads that undefined and names no global. the decorator's inline
  // function is a scope both emitters reach through a FRAME of their own, and the frame has to
  // surface the binding for that verdict - the third row is the control that it does not simply go
  // unvisited. the names are ones the legacy-decorator helper does not spell itself, so a
  // resurrected read shows in the import set instead of hiding behind the helper's own Map
  @first(function () {
    var Set = Set;
    return new Set([1]);
  })
  a() {}

  // `let`/`const` are real block-scoped shadows (their RHS sits in the TDZ) - the same verdict by a
  // different route, and the control that the two never diverge
  @second(function () {
    let WeakSet = WeakSet;
    return new WeakSet([{}]);
  })
  b() {}

  // ... and an unshadowed read in the same frame, which still polyfills
  @third(function () {
    return Array.from([1]);
  })
  c() {}
}
export { Uses };