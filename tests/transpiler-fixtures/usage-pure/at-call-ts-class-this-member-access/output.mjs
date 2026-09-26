import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
class Foo {
  items: number[] = [];
  getItems() {
    return this.items;
  }
}
_atMaybeArray(_ref = new Foo().getItems()).call(_ref, -1);