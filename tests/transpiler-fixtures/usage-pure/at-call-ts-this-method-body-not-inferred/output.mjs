import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
class Foo {
  getStr(): string[] {
    return [];
  }
  test() {
    return this.getStr();
  }
}
declare const f: Foo;
_atMaybeArray(_ref = f.test()).call(_ref, 0);