// in a static method `this` / `super` is the CONSTRUCTOR, and `at` / `flat` are instance-only
// (Array#at, not Array.at), so `this.at(0)` / `super.flat()` throw at runtime - injecting the
// instance polyfill would not help and must BAIL. a REAL inherited static (`super.from([1])`)
// still resolves and injects es.array.from; distinct methods prove the static-vs-instance split.
class Bails extends Array {
  static a() { return this.at(0); }
  static b() { return super.flat(); }
}
class Injects extends Array {
  static c() { return super.from([1]); }
}
Bails.a();
Bails.b();
Injects.c();
