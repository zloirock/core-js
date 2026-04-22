// TSSatisfiesExpression wrapper on the super-class alias — alias chain resolves
// through to Promise and `super.try` gets polyfilled
const A = Promise satisfies typeof Promise;
class C extends A {
  static run() { return super.try(() => 1); }
}
globalThis.__r = C.run();
