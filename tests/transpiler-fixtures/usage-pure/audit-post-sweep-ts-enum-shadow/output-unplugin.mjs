// `postSweepUnboundGlobals` Identifier sweep with TS-runtime shadow inside a function
// body: `enum Map {}` declares a runtime binding scope's `getBindingIdentifier` doesn't
// expose. without passing `idPath` to `adapter.hasBinding`, the TS-runtime walk anchors
// at Program scope and misses the inner `enum`. fix: thread `idPath` so the walker
// reaches `BlockStatement` / `TSModuleBlock` / `StaticBlock` anchors at the reference site
function f() {
  enum Map { Foo, Bar }
  return Map;
}