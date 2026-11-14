import _Map from "@core-js/pure/actual/map/constructor";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A public string key cannot hide the same-spelled private field.
// The private Object receiver still needs its own static method.
class Reader {
  static #owner = Object;
  static ["#owner"] = _Map;
  static read(items) {
    return _Object$groupBy(items, String);
  }
}
Reader.read([]);