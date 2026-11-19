// Exporting the class does not expose its private field to external mutation.
export class Reader {
  static #owner = Map;
  static read(items) { return Reader.#owner.groupBy(items, String); }
}
