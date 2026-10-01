// TS declaration merging: `class X {}` + `namespace X {}` - type-binding lookup walks
// through enclosing namespace declarations and only picks up type-bearing decls. The
// class provides instance method `.list()`, the namespace provides a static. `x.list()`
// must resolve to the class instance method's array return type.
class Widget {
  list(): string[] { return []; }
}
namespace Widget {
  export const VERSION = '1';
}
declare const w: Widget;
w.list().at(-1);
