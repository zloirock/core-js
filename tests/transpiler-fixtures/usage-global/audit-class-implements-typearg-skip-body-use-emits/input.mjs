// Same class node: `implements Foo<Map<...>>` (type-only, no Map polyfill) + body method
// `make()` returns `new Map()` (runtime, emit Map polyfill). pins the ClassBody hard-stop
// in the ancestor walker: the body's `new Map()` Identifier walks up past CallExpression,
// NewExpression, BlockStatement, FunctionExpression, MethodDefinition, ClassBody - hits
// ClassBody first which is in PURE_TYPE_ERASE_STOP_TYPES, returns false → polyfill emits.
// without the ClassBody stop, walker might continue up to TSClassImplements somewhere
// else in the same Class node and wrongly skip the body's Map. pins the scope-correctness
interface Foo<T> { x: T }
class X implements Foo<Map<string, number>> {
  make() { return new Map(); }
}
