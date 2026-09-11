// class field type is inferred across every `this.<field> = X` assignment, not only
// the initializer. `#box = null` plus `this.#box = Array.from(xs)` union to Array,
// so `this.#box?.at(0)` gets the array-specific `at` polyfill (not the generic one).
class Maybe {
  #box = null;
  set(xs) { this.#box = Array.from(xs); }
  firstOrNull() { return this.#box?.at(0) ?? null; }
}
