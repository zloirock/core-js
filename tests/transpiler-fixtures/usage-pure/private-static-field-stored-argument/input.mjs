class Reader {
  static #owner = Map;
  static set(value) { Reader.#owner = value; }
  static read(items) { return Reader.#owner.groupBy(items, String); }
}
Reader.set(Object);
const grouped = Reader.read([3])["3"];
const custom = { groupBy(xs) { return this === custom && xs; } };
Reader.set(custom);
export const result = [grouped, Reader.read([4])];
