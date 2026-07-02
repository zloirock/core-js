// a `class` declared inside `declare global { ... }` is ambient even without its own `declare`
// flag; its static-call return (`GBox.make<string>()` -> `string[]`) must narrow `.at` to the
// array variant on babel too (babel previously missed the in-global class, oxc found it via binding)
declare global {
  class GBox {
    static make<T>(): T[];
  }
}
GBox.make<string>().at(0);
