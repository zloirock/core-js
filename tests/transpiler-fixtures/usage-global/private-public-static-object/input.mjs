// A public string key cannot hide the same-spelled private field.
// The private Object receiver still needs its own static method.
class Reader {
  static #owner = Object;
  static ["#owner"] = Map;
  static read(items) { return Reader.#owner.groupBy(items, String); }
}
Reader.read([]);
