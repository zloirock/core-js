// `extends NS.Promise` where `const NS = { Promise }` - shorthand user-namespace wrapping
// the global. plugin resolves the member through the ObjectExpression init and routes
// `super.try(...)` through the Promise polyfill. unified `resolveBindingToGlobalName`
// primitive handles this alongside identifier aliases and proxy-global chains
const NS = { Promise };
class C extends NS.Promise {
  static run() { return super.try(() => 1); }
}
