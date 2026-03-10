var _ref;
import _atInstanceProperty from "@core-js/pure/actual/instance/at";
class Foo {
  getItems(): number[] {
    return [];
  }
}
const f = new Foo();
_atInstanceProperty(_ref = f.getItems()).call(_ref, -1);