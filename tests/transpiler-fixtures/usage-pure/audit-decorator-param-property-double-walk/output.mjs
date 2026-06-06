import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// a TSParameterProperty (constructor param with an accessibility / readonly modifier) carrying MULTIPLE
// legacy param decorators, each with a distinct polyfillable global. both engines omit `decorators`
// from this node's visitor keys: estree-toolkit (unplugin) hits its Object.keys fallback and auto-walks
// them, so the manual decorator walk must SKIP it (else a double-rewrite crash); @babel/traverse never
// descends into them, so babel must REQUEUE each (else under-polyfill). EVERY decorator must be
// polyfilled exactly once - two decorators guard that babel requeues the whole list, not just the first
class Foo {
  constructor(@inject(_Array$from([1]))
  @log(_Array$of(2))
  private p: number) {}
}