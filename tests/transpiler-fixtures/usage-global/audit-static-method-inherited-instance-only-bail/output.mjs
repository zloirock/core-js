import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// usage-global parity with usage-pure's audit-static-method-this-at-bail: in a static method `this` /
// `super` is the CONSTRUCTOR, and `at` / `flat` are instance-only (Array#at, not Array.at), so
// `this.at(0)` / `super.flat()` would throw at runtime. injecting the INSTANCE polyfill (es.array.at /
// es.array.flat) is over-injection - the static member still won't exist. the synthetic inherited-static
// meta resolves to an instance desc and must BAIL. a REAL inherited static (`super.from([1])`) still
// resolves and injects es.array.from - distinct methods prove the static-vs-instance discrimination
class Bails extends Array {
  static a() {
    return this.at(0);
  }
  static b() {
    return super.flat();
  }
}
class Injects extends Array {
  static c() {
    return super.from([1]);
  }
}
Bails.a();
Bails.b();
Injects.c();