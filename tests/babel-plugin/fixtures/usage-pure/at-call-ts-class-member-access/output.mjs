var _ref;
import _atInstanceProperty from "@core-js/pure/actual/instance/at";
class Foo {
  items: number[] = [];
}
const f = new Foo();
_atInstanceProperty(_ref = f.items).call(_ref, -1);