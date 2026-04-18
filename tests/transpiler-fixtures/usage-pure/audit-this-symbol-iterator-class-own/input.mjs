// unlike `super[Symbol.iterator]`, `this[Symbol.iterator]` does the same lookup as the
// polyfill helper `getIterator(this)` - the own-defined override is still reached
class C extends Map {
  [Symbol.iterator]() { return [][Symbol.iterator](); }
  use() { return this[Symbol.iterator](); }
}
