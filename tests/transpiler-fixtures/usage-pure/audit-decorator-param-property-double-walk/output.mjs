import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// a TSParameterProperty carrying MULTIPLE legacy param decorators, each with a distinct polyfillable
// global. both engines omit `decorators` from this node's visitor keys: estree-toolkit (unplugin)
// auto-walks them via its Object.keys fallback, so the manual walk must SKIP (else double-rewrite
// crash); @babel/traverse never descends, so babel must REQUEUE each (else under-polyfill the tail)
class Foo {
  constructor(@inject(_Array$from([1]))
  @log(_Array$of(2))
  private p: number) {}
}