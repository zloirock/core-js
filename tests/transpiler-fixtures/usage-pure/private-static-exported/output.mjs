import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Exporting the class does not expose its private field to external mutation.
export class Reader {
  static #owner = _Map;
  static read(items) {
    return _Map$groupBy(items, String);
  }
}