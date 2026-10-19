// `const A = Promise as typeof Promise` - alias init wrapped in TS as-cast.
const A = Promise as typeof Promise;
// @ts-expect-error a heritage tsc refuses is the shape under test
class C extends A {
  static run() { return super.resolve(1); }
}
globalThis.__r = C.run();
