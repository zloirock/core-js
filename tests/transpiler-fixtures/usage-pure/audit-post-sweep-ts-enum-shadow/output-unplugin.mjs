// post-sweep Identifier walk with a TS-runtime shadow inside a function body:
// `enum Map {}` declares a runtime binding the scope's `getBindingIdentifier` does
// not expose. Threading the reference path through binding-detection lets the TS-runtime
// walker anchor at the nearest `BlockStatement` / `TSModuleBlock` / `StaticBlock`
// instead of jumping to Program scope, so the inner `enum` shadow suppresses the
// global polyfill correctly
function f() {
  enum Map { Foo, Bar }
  return Map;
}