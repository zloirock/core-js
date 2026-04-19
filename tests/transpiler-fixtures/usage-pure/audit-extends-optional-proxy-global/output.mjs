import _globalThis from "@core-js/pure/actual/global-this";
import _Array$from from "@core-js/pure/actual/array/from";
// `globalThis?.Array` in extends — proxy-global recognized through ChainExpression (oxc) /
// OptionalMemberExpression (babel). `super.from(...)` polyfills to Array.from via superMeta
class X extends _globalThis.Array {
  static m() {
    return _Array$from.call(this, [1, 2, 3]);
  }
}
X.m();