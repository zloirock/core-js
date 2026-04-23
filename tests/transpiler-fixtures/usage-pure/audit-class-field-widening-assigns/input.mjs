// `#v = []` init says Array, but `reset()` later assigns a string literal - the union widens
// to Array|string. commonType returns null; dispatch falls to generic `_at` so the runtime
// string branch isn't mis-served by the Array-specific variant
class C {
  #v = [];
  reset() { this.#v = "idle"; }
  first() { return this.#v.at(0); }
}
