import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// MemberExpression alias: `const A = globalThis.Promise; class C extends A`.
// `resolveSuperClassName` walks aliases until hitting a non-Identifier init; here it falls
// through to `globalProxyMemberName` on the MemberExpression init to still resolve `Promise`
const A = _Promise;
class C extends A {
  static run(r) {
    return _Promise$try.call(this, r);
  }
}