import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Same class node: `implements Foo<Map<...>>` (type-only, no Map polyfill) + body method
// `make()` returns `new Map()` (runtime, emit Map polyfill). pins the ClassBody hard-stop
// in the ancestor walker: the body's `new Map()` Identifier walks up past CallExpression,
// NewExpression, BlockStatement, FunctionExpression, MethodDefinition, ClassBody - hits
// ClassBody first which is a pure-type-erase stop ancestor, returns false -> polyfill emits.
// without the ClassBody stop, walker might continue up to TSClassImplements somewhere
// else in the same Class node and wrongly skip the body's Map. pins the scope-correctness
interface Foo<T> {
  x: T;
}
class X implements Foo<Map<string, number>> {
  make() {
    return new Map();
  }
}