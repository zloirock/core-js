// negative companion: `this` inside a method BODY (not a computed key) correctly anchors to the
// enclosing class, so `this.foo()` narrows to the array return and `.at` resolves to the array
// helper. confirms the computed-key guard only skips key-ascent, not ordinary body-ascent
class C {
  foo() {
    return [1, 2, 3];
  }
  bar() {
    return this.foo().at(0);
  }
}
new C().bar();
