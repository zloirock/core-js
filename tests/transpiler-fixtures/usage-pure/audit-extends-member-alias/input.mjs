// MemberExpression alias: `const A = globalThis.Promise; class C extends A`.
// `resolveSuperClassName` walks aliases until hitting a non-Identifier init; here it falls
// through to `globalProxyMemberName` on the MemberExpression init to still resolve `Promise`
const A = globalThis.Promise;
class C extends A {
  static run(r) { return super.try(r); }
}
