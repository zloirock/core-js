import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
class Foo {
  getItems(): number[] {
    return [];
  }
}
const f = new Foo();
_atMaybeArray(_ref = f.getItems()).call(_ref, -1);