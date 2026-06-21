import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// decorator expressions on auto-accessor / abstract members carry polyfillable globals. estree-toolkit
// (unplugin) lacks `decorators` in its visitor keys, so its Object.keys fallback auto-walks them; the
// manual decorator walk must then SKIP these nodes or it double-rewrites the same span and crashes.
// (the abstract-FIELD shape `@dec abstract x` is babel@8-parser-rejected, so it lives in a unit test)
abstract class C {
  @_Array$from([1])
  accessor a = 1;
  @_Array$of(2)
  abstract accessor b: number;
}