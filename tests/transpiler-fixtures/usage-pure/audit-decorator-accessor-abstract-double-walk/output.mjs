import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// decorator expressions on auto-accessor / abstract members carry polyfillable globals. estree-toolkit
// (unplugin) auto-walks `decorators` for these node types - they are absent from its visitor keys, so
// the Object.keys fallback reaches them - meaning the manual decorator walk must SKIP them or it
// double-rewrites the same span and crashes the transform. one distinct polyfill per decorator.
// (the abstract-FIELD shape `@dec abstract x` is rejected by babel@8's parser, so it cannot live in a
// shared fixture - it is covered by the unplugin-unit decorator-double-walk crash test instead)
abstract class C {
  @_Array$from([1])
  accessor a = 1;
  @_Array$of(2)
  abstract accessor b: number;
}