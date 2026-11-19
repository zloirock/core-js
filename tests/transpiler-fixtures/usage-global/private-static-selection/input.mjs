// A private field can hold either constructor; both must carry the observed static.
export function reader(choice) {
  return class Reader {
    static #owner = choice ? Map : Object;
    static read(items) { return Reader?.#owner.groupBy(items, String); }
  };
}
