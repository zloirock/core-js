import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// `globalThis?.Array` in extends — proxy-global recognized through ChainExpression (oxc) /
// OptionalMemberExpression (babel). `super.from(...)` triggers `es.array.from` injection
class X extends globalThis?.Array {
  static m() {
    return super.from([1, 2, 3]);
  }
}
X.m();