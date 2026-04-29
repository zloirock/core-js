// Two classes, same name `C`, different scopes. Outer extends Array, inner extends Map.
// `super.from(x)` inside outer's static should polyfill Array.from, inner's `super.groupBy`
// should polyfill Map.groupBy. Plugin must correctly scope class resolution via the
// classBodyNode closest to the call site.
class C extends Array {
  static collect(x) { return super.from(x); }
  static inner() {
    class C extends Map {
      static gather(x) { return super.groupBy(x, y => y); }
    }
    return C.gather([1, 2, 3]);
  }
}
