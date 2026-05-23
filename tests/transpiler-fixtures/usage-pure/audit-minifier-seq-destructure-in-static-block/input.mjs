// minifier-shape inside a class `static {}` block. StaticBlock is a separate Statement-list
// host (distinct from BlockStatement) - covered by the explicit type list in
// `forEachStatementListBody`. uses `.fromEntries` so per-fixture polyfill keys stay distinct
let fromEntries;
class Cfg {
  static {
    (sideEffect(), ({ fromEntries } = Object));
  }
}
fromEntries([['k', 1]]);
Cfg;
