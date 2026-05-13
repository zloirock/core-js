// ImportDeclaration nested inside `declare module "x" { ... }` is type-only - TypeScript
// elides the whole block at runtime. The entry-detector must not treat it as a runtime
// entry and inject polyfill imports for code that never ships. Symmetric with the
// top-level-only ExpressionStatement scan and with unplugin's `ast.body`-only walk.
// Adding a top-level entry alongside the nested one shows that legitimate imports still
// flow through while the nested one is skipped.
declare module "polyfilled" {
  import 'core-js/actual/array/from';
}
import 'core-js/actual/array/at';
