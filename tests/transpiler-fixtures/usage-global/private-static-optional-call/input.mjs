// Optional invocation also observes a selected private field's required static.
export function reader(choice) {
  return class Reader {
    static #owner = choice ? Map : Object;
    static read(items) { return Reader?.#owner.groupBy?.(items, String); }
  };
}
