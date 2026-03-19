var _ref;
import _at from "@core-js/pure/actual/array/at";
class Foo {
  items: number[] = [];
  getItems() {
    return this.items;
  }
}
_at(_ref = new Foo().getItems()).call(_ref, -1);