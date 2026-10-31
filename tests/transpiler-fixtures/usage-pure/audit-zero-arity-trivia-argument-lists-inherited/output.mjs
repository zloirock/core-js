import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
class A extends Array {
  static f() {
    return _Array$from.call(this) /* none */;
  }
  // `this` in a static context resolves through the same inherited-static machinery
  static g() {
    return _Array$of.call(this) /* none */;
  }
}
export const inherited = A.f();