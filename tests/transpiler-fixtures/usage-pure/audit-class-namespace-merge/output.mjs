import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// TS declaration merging: `class X {}` + `namespace X {}` — `walkStatementsForDecl`
// collects only type-bearing declarations. The class provides instance method `.list()`,
// the namespace provides a static. Plugin should resolve `x.list()` to array return.
class Widget {
  list(): string[] {
    return [];
  }
}
namespace Widget {
  export const VERSION = '1';
}
declare const w: Widget;
_atMaybeArray(_ref = w.list()).call(_ref, -1);