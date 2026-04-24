// `globalThis?.Array` in extends - proxy-global recognized through ChainExpression (oxc) /
// OptionalMemberExpression (babel). `super.from(...)` polyfills to Array.from via superMeta
class X extends globalThis?.Array {
  static m() { return super.from([1, 2, 3]); }
}
X.m();
