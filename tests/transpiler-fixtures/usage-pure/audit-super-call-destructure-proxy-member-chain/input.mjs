// `const { Promise: MyP } = globalThis.self` - destructure init is a MemberExpression whose
// root is a known global proxy (`globalThis.self`). super-class resolution must walk through
// the member chain so `super.try()` maps to `Promise.try`, not to `self`
const { Promise: MyP } = globalThis.self;
class C extends MyP {
  static run(x) { return super.try(x); }
}
