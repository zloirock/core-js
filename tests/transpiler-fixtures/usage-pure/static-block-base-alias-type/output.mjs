import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// The base alias and inherited field belong to this static block.
class Box {
  static {
    var _ref;
    class Base {
      value = 'alice';
    }
    const Parent = Base;
    class Item extends Parent {}
    _atMaybeString(_ref = new Item().value).call(_ref, -1);
  }
}