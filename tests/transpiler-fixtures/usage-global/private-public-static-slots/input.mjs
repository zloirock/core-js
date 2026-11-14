// Private names and public string keys are distinct slots.
// Serving a named static does not require the whole constructor namespace.
class Reader {
  static #owner = Map;
  static ["#owner"] = Object;
  static read(items) { return Reader.#owner.groupBy(items, String); }
}
Reader.read([]);
