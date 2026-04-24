// `class C extends Array` overrides Array.from with its own static method. in a static
// block `this.from(1)` calls C.from, the user's deliberate override - polyfill must bail
// here, otherwise it would bypass the override and call Array.from's polyfilled version
class C extends Array {
  static from(x) {
    return [x, x];
  }
  static {
    this.from(1);
  }
}