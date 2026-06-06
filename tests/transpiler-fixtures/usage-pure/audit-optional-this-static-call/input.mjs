// `this.X?.()` resolves like `super.X?.()` ONLY inside a static method, where `this` is the
// constructor and `this.from` reads the inherited static `Array.from` -> always-defined polyfill, so
// the `?.` deoptimizes and the call-split binds `this`. inside an INSTANCE method `this.from` is a
// plain (own / prototype) lookup that is NOT always-defined, so the optional guard is kept
export class C extends Array {
  static a() {
    return this.from?.().at(0);
  }

  b() {
    return this.from?.().flat();
  }
}
