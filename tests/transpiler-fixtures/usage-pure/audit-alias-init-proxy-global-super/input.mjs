// Alias chain where `const P = globalThis.Promise` terminates at a proxy-global
// member. `class C extends P` still resolves `P` to `Promise`, so `super.try(...)`
// gets the `Promise.try` polyfill.
const P = globalThis.Promise;
class C extends P {
  static run() { return super.try(() => 1); }
}
