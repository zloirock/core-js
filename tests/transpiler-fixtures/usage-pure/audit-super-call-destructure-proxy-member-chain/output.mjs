import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `const { Promise: MyP } = globalThis.self` - destructure init is a MemberExpression, not a
// bare proxy-global identifier. resolveSuperClassName used to reject MemberExpression roots,
// so `super.try()` resolved to 'self' instead of 'Promise'. fix: accept MemberExpression inits
// whose root resolves via globalProxyMemberName
const MyP = _Promise;
class C extends MyP {
  static run(x) {
    return _Promise$try.call(this, x);
  }
}