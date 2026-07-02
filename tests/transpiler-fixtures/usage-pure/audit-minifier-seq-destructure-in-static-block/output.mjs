import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// minifier-shape inside a class `static {}` block. StaticBlock is a separate Statement-list
// host (distinct from BlockStatement) that the split must cover. uses `.fromEntries` so
// per-fixture polyfill keys stay distinct
let fromEntries;
class Cfg {
  static {
    sideEffect();
    fromEntries = _Object$fromEntries;
  }
}
fromEntries([['k', 1]]);
Cfg;