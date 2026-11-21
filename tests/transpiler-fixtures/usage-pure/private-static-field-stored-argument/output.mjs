import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
class Reader {
  static #owner = _Map;
  static set(value) {
    Reader.#owner = value;
  }
  static read(items) {
    var _ref;
    return _ref = Reader.#owner, _ref === Object ? _Object$groupBy(items, String) : _ref.groupBy(items, String);
  }
}
Reader.set(Object);
const grouped = Reader.read([3])["3"];
const custom = {
  groupBy(xs) {
    return this === custom && xs;
  }
};
Reader.set(custom);
export const result = [grouped, Reader.read([4])];