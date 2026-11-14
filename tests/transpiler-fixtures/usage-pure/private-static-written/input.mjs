// A named private-field write invalidates its initial constructor even inside a method.
export class Reader {
  static #owner = Map;
  static set(value) { Reader.#owner = value; }
  static read(items) { return Reader.#owner.groupBy(items, String); }
}
