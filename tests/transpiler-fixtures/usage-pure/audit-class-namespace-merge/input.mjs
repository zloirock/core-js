// TS declaration merging: `class X {}` + `namespace X {}` - `walkStatementsForDecl`
// collects only type-bearing declarations. The class provides instance method `.list()`,
// the namespace provides a static. Plugin should resolve `x.list()` to array return.
class Widget {
  list(): string[] { return []; }
}
namespace Widget {
  export const VERSION = '1';
}
declare const w: Widget;
w.list().at(-1);
