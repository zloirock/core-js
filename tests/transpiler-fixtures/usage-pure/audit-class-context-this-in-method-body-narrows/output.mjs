import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// control for the Decorator-boundary fix: `this.s` in a NORMAL method body (not in a
// decorator arg) must still resolve to the class C, since the method body's `this` IS
// bound by the class. asserts the Decorator-boundary check doesn't over-trigger on the
// happy path - the walker should NOT short-circuit on decorators that sit beside (not
// above) the body's `this`
class C {
  s: string = "hi";
  @decorator
  foo() {
    var _ref;
    _atMaybeString(_ref = this.s).call(_ref, 0);
  }
}
declare const decorator: <T>(target: T) => T;