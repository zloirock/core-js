// A member decorator reads outer `this`; the method body reads the subclass as `this`.
// The unknown decorator and exported subclass hand Array out, which loads none of its modules:
// core-js polyfills no Array constructor. So the import set isolates `this.of` from the outer `this.from`.
class C extends Array {
  @(this.from([1]))
  static foo() {}
  static bar() {
    return this.of(2);
  }
}
export { C };
