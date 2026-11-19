import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
class Foo {
  items: number[] = [];
}
const f = new Foo();
_atMaybeArray(_ref = f.items).call(_ref, -1);