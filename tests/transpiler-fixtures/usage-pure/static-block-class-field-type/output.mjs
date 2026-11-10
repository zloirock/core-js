import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A local class binding stays visible to its instance-field analysis.
class Box {
  static {
    var _ref;
    class Item {
      value = 'alice';
    }
    const item = new Item();
    _atMaybeString(_ref = item.value).call(_ref, -1);
  }
}