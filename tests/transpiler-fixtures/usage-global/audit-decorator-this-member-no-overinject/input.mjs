// A member decorator reads outer `this`; the method body reads the subclass as `this`.
// The unknown decorator and exported subclass require the complete inherited Array family.
// This global import set cannot isolate `this.from`; the pure counterpart distinguishes it.
class C extends Array {
  @(this.from([1]))
  static foo() {}
  static bar() {
    return this.of(2);
  }
}
export { C };
