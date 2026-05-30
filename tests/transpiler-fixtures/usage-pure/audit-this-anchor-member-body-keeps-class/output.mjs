import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// negative companion: `this` inside a method BODY (not a computed key) correctly anchors to the
// enclosing class, so `this.foo()` narrows to the array return and `.at` resolves to the array
// helper. confirms the computed-key guard only skips key-ascent, not ordinary body-ascent
class C {
  foo() {
    return [1, 2, 3];
  }
  bar() {
    var _ref;
    return _atMaybeArray(_ref = this.foo()).call(_ref, 0);
  }
}
new C().bar();