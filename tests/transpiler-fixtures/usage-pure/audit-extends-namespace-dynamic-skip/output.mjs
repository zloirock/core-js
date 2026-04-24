// dynamic init for the namespace object: `const NS = pickImpl()`. plugin can't evaluate the
// call at compile time, so the ObjectExpression-init check bails and `super.try(...)` stays
// unpolyfilled. users who need the polyfill can extend a resolvable form directly
const NS = pickImpl();
class C extends NS.Promise {
  static run() {
    return super.try(() => 1);
  }
}