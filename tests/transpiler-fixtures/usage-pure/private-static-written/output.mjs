import _Map from "@core-js/pure/actual/map";
// A named private-field write invalidates its initial constructor even inside a method.
export class Reader {
  static #owner = _Map;
  static set(value) {
    Reader.#owner = value;
  }
  static read(items) {
    return Reader.#owner.groupBy(items, String);
  }
}