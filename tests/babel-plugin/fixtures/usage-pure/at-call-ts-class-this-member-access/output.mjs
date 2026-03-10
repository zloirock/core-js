var _ref;
import _atInstanceProperty from "@core-js/pure/actual/instance/at";
class Foo {
  items: number[] = [];
  getItems() {
    return this.items;
  }
}
_atInstanceProperty(_ref = new Foo().getItems()).call(_ref, -1);