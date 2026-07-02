import _at from "@core-js/pure/actual/instance/at";
// an external write to a class field inside an instance field-initializer (deferred to construction)
// must fold into the field's inferred type even when it sits textually past the use: the write runs
// whenever the owning class is constructed, so its source position says nothing about ordering. the
// field widens to string|number[] and the chained `.at` bails to the generic helper
class A {
  items = [1, 2];
  m() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
class B {
  bad = (new A().items = "str");
}
new B();