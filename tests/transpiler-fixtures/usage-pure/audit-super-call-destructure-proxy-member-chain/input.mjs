// `const { Promise: MyP } = globalThis.self` - destructure init is a MemberExpression, not a
// bare proxy-global identifier. resolveSuperClassName used to reject MemberExpression roots,
// so `super.try()` resolved to 'self' instead of 'Promise'. fix: accept MemberExpression inits
// whose root resolves via globalProxyMemberName
const { Promise: MyP } = globalThis.self;
class C extends MyP {
  static run(x) { return super.try(x); }
}
