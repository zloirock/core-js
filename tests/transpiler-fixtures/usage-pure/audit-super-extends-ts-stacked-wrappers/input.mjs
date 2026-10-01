// stacked TS wrappers on the super-class alias: `(X satisfies Y) as Z`
const A = (Promise satisfies typeof Promise) as typeof Promise;
class C extends A {
  static run() { return super.try(() => 1); }
}
globalThis.__r = C.run();
