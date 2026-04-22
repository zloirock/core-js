// `const A = Promise as typeof Promise` — alias init wrapped in TSAsExpression.
const A = Promise as typeof Promise;
class C extends A {
  static run() { return super.resolve(1); }
}
globalThis.__r = C.run();
