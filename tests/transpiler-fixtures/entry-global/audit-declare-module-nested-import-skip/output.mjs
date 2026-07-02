import "core-js/modules/es.array.at";
// ImportDeclaration nested inside `declare module "x" { ... }` is type-only - TypeScript
// elides the whole block at runtime. entry detection must not treat it as a runtime
// entry and inject polyfill imports for code that never ships. the top-level entry
// alongside it shows legitimate imports still flow through while the nested one is skipped.
declare module "polyfilled" {
  import 'core-js/actual/array/from';
}