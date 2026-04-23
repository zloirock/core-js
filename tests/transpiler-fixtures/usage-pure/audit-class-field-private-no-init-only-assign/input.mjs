// private field without init (`#box;` - TDZ undefined) relies entirely on the assignment
// scan. `this.#box = Array.from(xs)` seeds the only candidate; fold yields Array and
// `.at(0)` picks the array-specific polyfill
class C {
  #box;
  load(xs) { this.#box = Array.from(xs); }
  first() { return this.#box.at(0); }
}
