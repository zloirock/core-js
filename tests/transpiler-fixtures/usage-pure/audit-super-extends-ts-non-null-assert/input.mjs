// non-null assertion (`!`) on the super-class alias - alias chain resolves to
// Promise and `super.resolve` gets polyfilled
const A = Promise!;
// @ts-expect-error a heritage tsc refuses is the shape under test
class C extends A {
  static run() { return super.resolve(1); }
}
globalThis.__r = C.run();
