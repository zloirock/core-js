import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
class Foo {
  getItems(): number[] {
    return [];
  }
}
declare const f: Foo;
_atMaybeArray(_ref = f.getItems()).call(_ref, -1);