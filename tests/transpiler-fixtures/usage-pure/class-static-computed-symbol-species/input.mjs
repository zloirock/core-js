class C extends Map {
  static [Symbol.species]() { return Map; }
}
