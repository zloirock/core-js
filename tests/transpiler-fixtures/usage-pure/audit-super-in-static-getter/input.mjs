// `super.X` inside a static getter / setter - getters and setters are methods with
// `static: true`, so they're treated as static context same as regular static methods.
// `super.allSettled(...)` / `super.resolve(x)` both polyfill through Promise.allSettled
// and Promise.resolve respectively
class C extends Promise {
  static get helper() {
    return super.allSettled([]);
  }
  static set setter(x) {
    super.resolve(x);
  }
}
