import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Same class node: `implements Foo<Map<...>>` (type-only, no polyfill) + body method
// `make()` returns `new Map()` (runtime, emit). the body's `new Map()` must read as a
// runtime use even though a type-only `Map` sits in the implements clause of the SAME
// class - ClassBody is a pure-type-erase stop, so the upward scan halts there and emits
// the polyfill rather than wrongly reaching the implements clause and skipping it.
interface Foo<T> {
  x: T;
}
class X implements Foo<Map<string, number>> {
  make() {
    return new Map();
  }
}