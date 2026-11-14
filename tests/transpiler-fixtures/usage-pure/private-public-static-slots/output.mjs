import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Private names and public string keys are distinct slots.
// Serving a named static does not require the whole constructor namespace.
class Reader {
  static #owner = _Map;
  static ["#owner"] = Object;
  static read(items) {
    return _Map$groupBy(items, String);
  }
}
Reader.read([]);