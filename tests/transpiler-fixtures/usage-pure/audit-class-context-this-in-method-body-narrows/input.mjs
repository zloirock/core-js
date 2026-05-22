// `this.s` inside a decorated method body: `this` is bound by the enclosing class, so
// the field `s: string` resolves to string and `this.s.at(0)` emits the string-instance
// polyfill (the adjacent decorator does not break the binding).
class C {
  s: string = "hi";
  @decorator
  foo() {
    this.s.at(0);
  }
}
declare const decorator: <T>(target: T) => T;
