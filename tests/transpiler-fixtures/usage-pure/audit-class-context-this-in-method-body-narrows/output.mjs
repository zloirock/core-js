import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `this.s` inside a decorated method body: `this` is bound by the enclosing class, so
// the field `s: string` resolves to string and `this.s.at(0)` emits the string-instance
// polyfill (the adjacent decorator does not break the binding).
class C {
  s: string = "hi";
  @decorator
  foo() {
    var _ref;
    _atMaybeString(_ref = this.s).call(_ref, 0);
  }
}
declare const decorator: <T>(target: T) => T;