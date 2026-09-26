// no `extends` means `this.from(...)` in a static block has no super class
// whose static `from` to inherit - plugin must not inject any polyfill
// (runtime would hit `C.from is undefined` anyway)
class C {
  static {
    this.from([1, 2]);
  }
}
