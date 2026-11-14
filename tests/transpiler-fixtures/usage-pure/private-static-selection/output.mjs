import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A private field can hold either constructor; both must carry the observed static.
export function reader(choice) {
  return class Reader {
    static #owner = choice ? _Map : Object;
    static read(items) {
      var _ref;
      return null == Reader ? void 0 : (_ref = Reader.#owner, _ref === Object ? _Object$groupBy(items, String) : _ref.groupBy(items, String));
    }
  };
}